use mongodb::{Client, bson::oid::ObjectId};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct ServiceState {
    pub db_uri: String,
    pub db_name: String,
    pub db_coll_name: String,
    pub address: String,
    pub client: Client
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct Replay {
    #[serde(default, skip_serializing)]
    pub _id: ObjectId,
    #[serde(default)]
    pub id: String,
    #[serde(rename = "missionName")]
    pub mission_name: String,
    pub date: String,
    pub duration: i32,
    #[serde(rename = "worldName")]
    pub world_name: String,
    pub config: Config,
    pub data: Vec<Frame>
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct ReplaySlim {
    #[serde(default, skip_serializing)]
    pub _id: ObjectId,
    pub data: Vec<Frame>
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
    pub tracked_vehicles: bool
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct Frame {
    pub data: Vec<Record>,
    pub time: String,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
pub struct Record {
    pub color: Vec<f32>,
    pub direction: f32,
    pub group: String,
    pub icon: String,
    pub name: String,
    pub position: Vec<f32>
}