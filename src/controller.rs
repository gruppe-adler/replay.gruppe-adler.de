use actix_files::NamedFile;
use actix_web::{
    delete, dev::ServiceRequest, error::ErrorUnauthorized, get, post, web, Error, HttpResponse,
};
use actix_web_httpauth::{extractors::bearer::BearerAuth, middleware::HttpAuthentication};

use futures::io;
use log::warn;

use crate::actions;
use crate::model::{ReplayData, ServiceState};

async fn bearer_check(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, Error> {
    let app_data: Option<&web::Data<ServiceState>> = req.app_data();
    if let Some(state) = app_data {
        if credentials.token() == state.token {
            return Ok(req);
        }
    };

    let peer_ip = match req.peer_addr() {
        Some(addr) => addr.to_string(),
        None => String::from("n/a"),
    };

    warn!(
        "Invalid Bearer Token {:?} {:?} {:?}",
        peer_ip,
        req.headers(),
        req.match_info()
    );
    Err(ErrorUnauthorized("Invalid Bearer Token"))
}

#[post("/api", wrap = "HttpAuthentication::bearer(bearer_check)")]
async fn post_insert(
    state: web::Data<ServiceState>,
    replay: web::Json<ReplayData>,
) -> HttpResponse {
    let insert_result = web::block(move || {
        let conn = state.pool.get()?;
        actions::insert_replay(replay, &conn)
    })
    .await
    .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
    });

    match insert_result {
        Ok(result) => match result {
            Ok(_) => HttpResponse::Created().body("Replay created."),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        },
        Err(e) => e,
    }
}

#[get("/api")]
async fn get_all(state: web::Data<ServiceState>) -> HttpResponse {
    let replays_res = web::block(move || {
        let conn = state.pool.get()?;
        actions::get_all(&conn)
    })
    .await
    .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    });

    match replays_res {
        Ok(replays_vec) => match replays_vec {
            Ok(replays) => HttpResponse::Ok().json(replays),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        },
        Err(e) => e,
    }
}

#[get("/api/{id}")]
async fn get_id(state: web::Data<ServiceState>, id: web::Path<i32>) -> HttpResponse {
    let replay_result = web::block(move || {
        let conn = state.pool.get()?;
        actions::get_by_id(id.into_inner(), &conn)
    })
    .await
    .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    });

    match replay_result {
        Ok(replay_res) => match replay_res {
            Ok(replay) => HttpResponse::Ok().json(replay),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        },
        Err(e) => e,
    }
}

#[delete("/api/{id}", wrap = "HttpAuthentication::bearer(bearer_check)")]
async fn delete_id(state: web::Data<ServiceState>, id: web::Path<i32>) -> HttpResponse {
    let delete_result = web::block(move || {
        let conn = state.pool.get()?;
        actions::delete_by_id(id.into_inner(), &conn)
    })
    .await
    .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
    });

    match delete_result {
        Ok(result) => match result {
            Ok(_) => HttpResponse::Ok().body("Replay deleted."),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        },
        Err(e) => e,
    }
}

#[get("/api/{id}/data/{index}")]
async fn get_id_index(
    params: web::Path<(i32, i64)>,
    state: web::Data<ServiceState>,
) -> HttpResponse {
    get_sliced((params.0, params.1, None), state).await
}

#[get("/api/{id}/data/{index}/{amount}")]
async fn get_id_index_amount(
    params: web::Path<(i32, i64, i64)>,
    state: web::Data<ServiceState>,
) -> HttpResponse {
    get_sliced((params.0, params.1, Some(params.2)), state).await
}

async fn get_sliced(
    (id, index, amount): (i32, i64, Option<i64>),
    state: web::Data<ServiceState>,
) -> HttpResponse {
    let frame_result = web::block(move || {
        let conn = state.pool.get()?;
        actions::get_data_by_id(id, index, amount.unwrap_or(1), &conn)
    })
    .await
    .map_err(|e| {
        eprintln!("{}", e);
        HttpResponse::InternalServerError().body(e.to_string())
    });

    match frame_result {
        Ok(frame_res) => match frame_res {
            Ok(replay) => HttpResponse::Ok().json(replay),
            Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        },
        Err(e) => e,
    }
}

pub async fn index() -> io::Result<NamedFile> {
    Ok(NamedFile::open("./static/index.html")?)
}
