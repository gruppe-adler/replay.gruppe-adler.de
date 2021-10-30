mod model;
mod controller;

use std::sync::mpsc;
use std::thread;

use actix_files::Files;

use actix_web::middleware::Logger;
use actix_web::{App, HttpServer, middleware, web};

use futures::executor;

use model::ServiceState;
use mongodb::Client;

use crate::controller::{delete_id, get_all, get_id, get_id_index, get_id_index_amount, post_insert};

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let uri = std::env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".into());
    let address = std::env::var("REPLAY_SERVICE_ADDRESS").unwrap_or("127.0.0.1:8080".into());
    let state = ServiceState {
        db_uri: uri.clone(),
        db_name: std::env::var("MONGODB_DB_NAME").unwrap_or("replay".into()),
        db_coll_name: std::env::var("MONGODB_COLL_NAME").unwrap_or("replays".into()),

        address: address.clone(),
        client: Client::with_uri_str(uri).await.expect("failed to connect"),

        token:  std::env::var("REPLAY_SERVICE_TOKEN").unwrap_or_default(),
    };

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let (_tx, rx) = mpsc::channel::<()>();

    let server = HttpServer::new(move || {
        App::new()
            .wrap(middleware::Compress::default())
            .wrap(Logger::default())
            .app_data(web::PayloadConfig::new(1 << 25))
            .app_data(web::JsonConfig::default().limit(1024 * 1024 * 50))
            .app_data(web::Data::new(state.clone()))

            .service(post_insert)
            .service(get_all)
            .service(get_id)
            .service(get_id_index)
            .service(get_id_index_amount)
            .service(delete_id)
            .service(Files::new("/", "./static").prefer_utf8(true).show_files_listing())
    })
    .bind(address)?
    .run();

     let srv = server.clone();
     thread::spawn(move || {
         rx.recv().unwrap_or_default();

         executor::block_on(srv.stop(true))
     });

     server.await
}
