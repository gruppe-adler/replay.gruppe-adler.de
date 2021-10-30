use actix_web::{Error, HttpResponse, delete, dev::ServiceRequest, error::ErrorUnauthorized, get, post, web};
use actix_web_httpauth::{extractors::bearer::BearerAuth, middleware::HttpAuthentication};
use futures::TryStreamExt;
use log::warn;
use mongodb::{Collection, bson::{doc, oid::ObjectId}, options::FindOneOptions};

use crate::model::{Replay, ReplaySlim, ServiceState};


async fn bearer_check(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, Error> {
    if credentials.token() == "MEH" {
        Ok(req)
    } else {
        let peer_ip = match req.peer_addr() {
          Some(addr) => addr.to_string(),
          None => "n/a".to_string()
        };

        warn!("Invalid Bearer Token {:?} {:?} {:?}", peer_ip, req.headers(), req.match_info());
        Err(ErrorUnauthorized("Invalid Bearer Token"))
    }
}

#[post("/api", wrap = "HttpAuthentication::bearer(bearer_check)")]
async fn post_insert(
    state: web::Data<ServiceState>,
    mut replay: web::Json<Replay>
) -> HttpResponse {
    let collection = state.client.database(&state.db_name).collection(&state.db_coll_name);

    replay._id = ObjectId::new();
    replay.id = replay._id.to_hex();

    let result = collection.insert_one(replay.into_inner(), None).await;
    match result {
        Ok(_) => HttpResponse::Created().body(""),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[get("/api")]
async fn get_all(
    state: web::Data<ServiceState>
) -> HttpResponse {
    let collection: Collection<Replay> = state.client.database(&state.db_name).collection(&state.db_coll_name);

    let r = collection
         .find(None, None)
         .await;
    match r {
        Ok(cursor) => HttpResponse::Ok().json(cursor.try_collect().await.unwrap_or_else(|_| vec![])),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string())
    }
}

#[get("/api/{id}")]
async fn get_id(
    state: web::Data<ServiceState>,
    id: web::Path<String>
) -> HttpResponse {
    let collection: Collection<Replay> = state.client.database(&state.db_name).collection(&state.db_coll_name);

    if let Ok(oid) = ObjectId::parse_str(id.as_str()) {
        return match collection
            .find_one(doc! { "_id": oid }, None)
            .await
            {
                Ok(Some(user)) => HttpResponse::Ok().json(user),
                Ok(None) => HttpResponse::NotFound()
                    .body(format!("No replay found with ID: {}", id)),
                Err(err) =>  HttpResponse::InternalServerError()
                    .body(err.to_string()),
            }
    } else {
        return HttpResponse::NotFound()
            .body(format!("No replay found with ID: {}", id));
    }
}

#[delete("/api/{id}", wrap = "HttpAuthentication::bearer(bearer_check)")]
async fn delete_id(
    state: web::Data<ServiceState>,
    id: web::Path<String>
) -> HttpResponse {
    let collection: Collection<Replay> = state.client.database(&state.db_name).collection(&state.db_coll_name);

    if let Ok(oid) = ObjectId::parse_str(id.as_str()) {
        return match collection
            .delete_one(doc! { "_id": oid }, None)
            .await
            {
                Ok(_) => HttpResponse::Ok().body(""),
                Err(err) =>  HttpResponse::InternalServerError()
                    .body(err.to_string()),
            }

    } else {
        return HttpResponse::NotFound()
            .body(format!("No replay found with ID: {}", id));
    }
}

#[get("/api/{id}/data/{index}")]
async fn get_id_index(
    params: web::Path<(String, u32)>,
    state: web::Data<ServiceState>
) -> HttpResponse {
    get_sliced((params.0.as_str(), params.1, None), state).await
}

#[get("/api/{id}/data/{index}/{amount}")]
async fn get_id_index_amount(
    params: web::Path<(String, u32, u32)>,
    state: web::Data<ServiceState>
) -> HttpResponse {
    get_sliced((params.0.as_str(), params.1, Some(params.2)), state).await
}

async fn get_sliced(
    (id, index, amount): (&str, u32, Option<u32> ),
    state: web::Data<ServiceState>,
) -> HttpResponse {
    let collection: Collection<ReplaySlim> = state.client.database(&state.db_name).collection(&state.db_coll_name);
    let find_one_options = FindOneOptions::builder().projection(doc! { "_id": 1, "data": { "$slice" : [index, amount.unwrap_or(1)] } }).build();

    if let Ok(oid) = ObjectId::parse_str(id) {
        return match collection
            .find_one(doc! { "_id": oid }, find_one_options)
            .await
            {
                Ok(Some(replay)) => HttpResponse::Ok().json(replay.data),
                Ok(None) => HttpResponse::NotFound()
                    .body(format!("No replay found with ID: {}", id)),
                Err(err) =>  HttpResponse::InternalServerError()
                    .body(err.to_string()),
            }
    } else {
        return HttpResponse::NotFound()
            .body(format!("No replay found with ID: {}", id));
    }
}