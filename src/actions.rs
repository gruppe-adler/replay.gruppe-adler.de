use std::collections::HashMap;

use actix_web::web;
use chrono::NaiveDateTime;
use diesel::prelude::*;

use crate::model::{
    self, Frame, FrameDb, FrameDbResult, Record, RecordDb, RecordDbResult, Replay, ReplayData,
    ReplayDbResult,
};

type DbError = Box<dyn std::error::Error + Send + Sync>;

pub fn get_all(conn: &PgConnection) -> Result<Vec<model::Replay>, DbError> {
    use crate::schema::replay::dsl::*;

    let replays_db = replay.load::<ReplayDbResult>(conn)?;

    let mut replays_json: Vec<Replay> = Vec::with_capacity(replays_db.len());
    for replay_db in replays_db {
        replays_json.push(replay_db.into());
    }

    Ok(replays_json)
}

pub fn get_by_id(replay_id: i32, conn: &PgConnection) -> Result<model::Replay, DbError> {
    use crate::schema::replay::dsl::*;

    let replay_db = replay.find(replay_id).get_result::<ReplayDbResult>(conn)?;

    Ok(replay_db.into())
}

pub fn get_data_by_id(
    replay_id: i32,
    offset: i64,
    amount: i64,
    conn: &PgConnection,
) -> Result<Vec<model::Frame>, DbError> {
    use crate::schema::frame::dsl::*;
    use crate::schema::record::dsl::*;

    let frames_db = frame
        .filter(id_replay.eq(replay_id))
        .order_by(crate::schema::frame::dsl::id)
        .offset(offset)
        .limit(amount)
        .get_results::<FrameDbResult>(conn)?;

    let ids: Vec<i32> = frames_db.clone().into_iter().map(|val| val.id).collect();

    let records_db = record
        .filter(id_frame.eq_any(ids))
        .get_results::<RecordDbResult>(conn)?;

    let mut map: HashMap<i32, Vec<Record>> = HashMap::with_capacity(records_db.len());

    for record_db in records_db {
        if let Some(res_list) = map.get_mut(&record_db.id_frame) {
            res_list.push(record_db.into());
        } else {
            map.insert(record_db.id_frame, vec![record_db.into()]);
        }
    }

    let mut frames_json: Vec<Frame> = Vec::with_capacity(frames_db.len());
    for frame_db in frames_db {
        let empty = Vec::<Record>::new();
        let record_db = map.get(&frame_db.id).unwrap_or(&empty);
        frames_json.push(Frame {
            id: frame_db.id,
            data: record_db.to_vec(),
            time: frame_db.time,
        });
    }

    Ok(frames_json)
}

pub fn delete_by_id(replay_id: i32, conn: &PgConnection) -> Result<(), DbError> {
    use crate::schema::replay::dsl::*;

    diesel::delete(replay.filter(id.eq(replay_id))).execute(conn)?;

    Ok(())
}

pub fn insert_replay(json: web::Json<ReplayData>, conn: &PgConnection) -> Result<(), DbError> {
    use crate::schema::frame::dsl::*;
    use crate::schema::record::dsl::*;
    use crate::schema::replay::dsl::*;

    let replay_db = model::ReplayDb {
        mission_name: json.mission_name.clone(),
        mission_date: NaiveDateTime::parse_from_str(&json.date, "%Y-%m-%d %H:%M:%S")
            .unwrap_or_else(|_| NaiveDateTime::from_timestamp(0, 0)),
        duration: json.duration,
        world_name: json.world_name.clone(),
        frame_count: json.data.len() as i64,
        precision: json.config.precision,
        sending_chunk_size: json.config.sending_chunk_size,
        steps_per_tick: json.config.steps_per_tick,
        track_shots: json.config.track_shots,
        tracked_ai: json.config.tracked_ai,
        tracked_sides: json.config.tracked_sides.clone(),
        tracked_vehicles: json.config.tracked_vehicles,
    };

    let res: ReplayDbResult = diesel::insert_into(replay)
        .values(replay_db)
        .get_result(conn)?;

    let mut record_count = 0;
    let mut frames_db: Vec<FrameDb> = Vec::with_capacity(json.date.len());
    for frame_db in json.data.iter() {
        record_count += frame_db.data.len();
        frames_db.push(model::FrameDb {
            id_replay: res.id,
            time: frame_db.time.clone(),
        })
    }

    let frames_res: Vec<FrameDbResult> = diesel::insert_into(frame)
        .values(frames_db)
        .get_results(conn)?;

    let mut record_db: Vec<RecordDb> = Vec::with_capacity(record_count);
    (0..=frames_res.len() - 1).for_each(|i| {
        let frame_json = &json.data[i];
        let frame_db = &frames_res[i];

        for record_json in frame_json.data.iter() {
            record_db.push(model::RecordDb {
                id_frame: frame_db.id,
                color: record_json.color.clone(),
                direction: record_json.direction,
                group: record_json.group.clone(),
                icon: record_json.icon.clone(),
                name: record_json.name.clone(),
                position: record_json.position.clone(),
                target: record_json.target.clone().unwrap_or_default(),
            });
        }
    });

    for record_chunk in record_db.chunks(65000 / 10) {
        diesel::insert_into(record)
            .values(record_chunk)
            .execute(conn)?;
    }
    Ok(())
}
