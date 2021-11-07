use chrono::NaiveDateTime;
use diesel::r2d2::ConnectionManager;
use diesel::r2d2::Pool;
use diesel::Insertable;
use diesel::PgConnection;
use diesel::Queryable;
use serde::{Deserialize, Serialize};

use crate::schema::frame;
use crate::schema::record;
use crate::schema::replay;

#[derive(Clone)]
pub struct ServiceState {
    pub service_address: String,
    pub pool: Pool<ConnectionManager<PgConnection>>,
    pub token: String,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct Replay {
    #[serde(default)]
    pub id: i32,
    #[serde(rename = "missionName")]
    pub mission_name: String,
    pub date: String,
    pub duration: i32,
    #[serde(rename = "worldName")]
    pub world_name: String,
    pub config: Config,
    #[serde(default, rename = "frameCount")]
    pub frame_count: usize,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct ReplayData {
    #[serde(default)]
    pub id: i32,
    #[serde(rename = "missionName")]
    pub mission_name: String,
    pub date: String,
    pub duration: i32,
    #[serde(rename = "worldName")]
    pub world_name: String,
    pub config: Config,
    #[serde(default, rename = "frameCount")]
    pub frame_count: usize,
    pub data: Vec<Frame>,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct ReplaySlim {
    #[serde(default, skip_serializing)]
    pub id: i32,
    pub data: Vec<Frame>,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct Config {
    pub precision: i32,
    #[serde(rename = "sendingChunkSize")]
    pub sending_chunk_size: i32,
    #[serde(rename = "stepsPerTick")]
    pub steps_per_tick: i32,
    #[serde(rename = "trackShots")]
    pub track_shots: bool,
    #[serde(rename = "trackedAI")]
    pub tracked_ai: bool,
    #[serde(rename = "trackedSides")]
    pub tracked_sides: Vec<String>,
    #[serde(rename = "trackedVehicles")]
    pub tracked_vehicles: bool,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct Frame {
    #[serde(default)]
    pub id: i32,
    pub data: Vec<Record>,
    pub time: String,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
//#[table_name = "records"]
pub struct Record {
    #[serde(default)]
    pub id: i32,
    pub color: Vec<f32>,
    pub direction: f32,
    pub group: String,
    pub icon: String,
    pub name: String,
    pub position: Vec<f32>,
    #[serde(default)]
    pub target: Option<Vec<f32>>,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize, Insertable)]
#[table_name = "record"]
pub struct RecordDb {
    pub id_frame: i32,
    pub color: Vec<f32>,
    pub direction: f32,
    pub group: String,
    pub icon: String,
    pub name: String,
    pub position: Vec<f32>,
    pub target: Vec<f32>,
}

#[derive(
    Clone, Debug, PartialEq, Deserialize, Serialize, Queryable, Associations, Identifiable,
)]
#[table_name = "record"]
#[belongs_to(FrameDbResult, foreign_key = "id_frame")]
pub struct RecordDbResult {
    pub id: i32,
    pub id_frame: i32,
    pub color: Vec<f32>,
    pub direction: f32,
    pub group: String,
    pub icon: String,
    pub name: String,
    pub position: Vec<f32>,
    pub target: Vec<f32>,
}

impl From<RecordDbResult> for Record {
    fn from(val: RecordDbResult) -> Self {
        Record {
            id: val.id,
            color: val.color,
            direction: val.direction,
            group: val.group,
            icon: val.icon,
            name: val.name,
            position: val.position,
            target: Some(val.target),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize, Insertable)]
#[table_name = "frame"]
pub struct FrameDb {
    pub id_replay: i32,
    pub time: String,
}

#[derive(
    Clone, Debug, PartialEq, Deserialize, Serialize, Queryable, Associations, Identifiable,
)]
#[table_name = "frame"]
#[belongs_to(ReplayDbResult, foreign_key = "id_replay")]
pub struct FrameDbResult {
    pub id: i32,
    pub id_replay: i32,
    pub time: String,
}

impl From<FrameDbResult> for Frame {
    fn from(frame: FrameDbResult) -> Self {
        Frame {
            id: frame.id,
            data: Vec::new(),
            time: frame.time,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize, Insertable)]
#[table_name = "replay"]
pub struct ReplayDb {
    pub mission_name: String,
    pub mission_date: NaiveDateTime,
    pub duration: i32,
    pub world_name: String,
    pub frame_count: i64,
    pub precision: i32,
    pub sending_chunk_size: i32,
    pub steps_per_tick: i32,
    pub track_shots: bool,
    pub tracked_ai: bool,
    pub tracked_sides: Vec<String>,
    pub tracked_vehicles: bool,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize, Queryable, Identifiable)]
#[table_name = "replay"]
pub struct ReplayDbResult {
    pub id: i32,
    pub mission_name: String,
    pub mission_date: NaiveDateTime,
    pub duration: i32,
    pub world_name: String,
    pub frame_count: i64,
    pub precision: i32,
    pub sending_chunk_size: i32,
    pub steps_per_tick: i32,
    pub track_shots: bool,
    pub tracked_ai: bool,
    pub tracked_sides: Vec<String>,
    pub tracked_vehicles: bool,
}

impl From<ReplayDbResult> for Replay {
    fn from(val: ReplayDbResult) -> Self {
        Replay {
            id: val.id,
            mission_name: val.mission_name,
            date: val.mission_date.to_string(),
            duration: val.duration,
            world_name: val.world_name,
            config: Config {
                precision: val.precision,
                sending_chunk_size: val.sending_chunk_size,
                steps_per_tick: val.steps_per_tick,
                track_shots: val.track_shots,
                tracked_ai: val.tracked_ai,
                tracked_sides: val.tracked_sides,
                tracked_vehicles: val.tracked_vehicles,
            },
            frame_count: val.frame_count as usize,
        }
    }
}
