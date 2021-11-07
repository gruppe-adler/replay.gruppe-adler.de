mod actions;
mod controller;
mod model;
mod schema;

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;
extern crate dotenv;

use diesel::pg::PgConnection;
use diesel_migrations::run_pending_migrations;
use dotenv::dotenv;

use std::sync::mpsc;
use std::thread;

use actix_files::Files;

use actix_web::middleware::{Logger, NormalizePath};
use actix_web::{middleware, web, App, HttpServer};

use diesel::r2d2::ConnectionManager;
use diesel::r2d2::Pool;
use futures::executor;

use model::ServiceState;

use crate::controller::{
    delete_id, get_all, get_id, get_id_index, get_id_index_amount, index, post_insert,
};

embed_migrations!();

fn init_state() -> ServiceState {
    dotenv().ok();

    // set up database connection pool
    let connspec = std::env::var("REPLAY_DB_URL").expect("Invalid Database Url");
    let manager = ConnectionManager::<PgConnection>::new(connspec);
    let pool = Pool::new(manager).expect("Creating connection pool failed");

    if let Ok(conn) = pool.get() {
        if let Err(e) = run_pending_migrations(&conn) {
            panic!("Running migrations failed: {}", e.to_string());
        }
    }

    let service_address =
        std::env::var("REPLAY_SERVICE_ADDRESS").unwrap_or_else(|_| String::from("127.0.0.1:8080"));

    ServiceState {
        service_address,
        pool,
        token: std::env::var("REPLAY_SERVICE_TOKEN").unwrap_or_else(|_| String::from("MEH")),
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
