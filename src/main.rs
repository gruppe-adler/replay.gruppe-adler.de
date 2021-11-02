mod controller;
mod model;

use std::sync::mpsc;
use std::thread;

use actix_files::Files;

use actix_web::middleware::{Logger, NormalizePath};
use actix_web::{middleware, web, App, HttpServer};

use futures::executor;

use model::ServiceState;
use mongodb::options::{ClientOptions, Credential, ServerAddress};
use mongodb::Client;

use crate::controller::{
    delete_id, get_all, get_id, get_id_index, get_id_index_amount, index, post_insert,
};

fn init_state() -> ServiceState {
    let monogo_host = std::env::var("REPLAY_MONGODB_HOST").unwrap_or_else(|_| "localhost".into());

    let mongo_port: u16 = std::env::var("REPLAY_MONGODB_PORT")
        .unwrap_or_else(|_| "27017".to_string())
        .parse()
        .unwrap_or(27017);

    let mongo_user =
        std::env::var("REPLAY_MONGODB_USER").unwrap_or_else(|_| "replayservice".into());

    let mongo_pw = std::env::var("REPLAY_MONGODB_PW").unwrap_or_else(|_| "replayservice".into());

    let mongo_db = std::env::var("REPLAY_MONGODB_DB").unwrap_or_else(|_| "replayservice".into());

    let mongo_coll = std::env::var("REPLAY_MONGODB_COLL").unwrap_or_else(|_| "replays".into());

    let mongo_options = ClientOptions::builder()
        .credential(
            Credential::builder()
                .username(mongo_user)
                .password(mongo_pw)
                .source(mongo_db.clone())
                .build(),
        )
        .direct_connection(true)
        .hosts([ServerAddress::Tcp {
            host: monogo_host,
            port: Some(mongo_port),
        }])
        .build();

    let service_address =
        std::env::var("REPLAY_SERVICE_ADDRESS").unwrap_or_else(|_| "127.0.0.1:8080".into());

    ServiceState {
        mongo_db,
        mongo_coll,

        service_address,
        client: Client::with_options(mongo_options).expect("failed to connect"),

        token: std::env::var("REPLAY_SERVICE_TOKEN").unwrap_or_else(|_| "MEH".to_string()),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let (_tx, rx) = mpsc::channel::<()>();

    let state = init_state();
    let service_address = state.service_address.clone();

    let server = HttpServer::new(move || {
        App::new()
            .wrap(middleware::Compress::default())
            .wrap(Logger::default())
            .wrap(NormalizePath::trim())
            .app_data(web::PayloadConfig::new(1 << 25))
            .app_data(web::JsonConfig::default().limit(1024 * 1024 * 50))
            .app_data(web::Data::new(state.clone()))
            .service(post_insert)
            .service(get_all)
            .service(get_id)
            .service(get_id_index)
            .service(get_id_index_amount)
            .service(delete_id)
            .default_service(web::get().to(index))
            .service(
                Files::new("/", "./static")
                    .prefer_utf8(true)
                    .index_file("index.html"),
            )
    })
    .bind(service_address)?
    .run();

    let srv = server.clone();
    thread::spawn(move || {
        rx.recv().unwrap_or_default();

        executor::block_on(srv.stop(true))
    });

    server.await
}
