-- Your SQL goes here
CREATE TABLE replay
(
    id serial,
    mission_name text NOT NULL,
    mission_date timestamp without time zone NOT NULL DEFAULT NOW(),
    duration integer NOT NULL DEFAULT 0,
    world_name text NOT NULL,
    frame_count bigint NOT NULL DEFAULT 0,
    "precision" integer NOT NULL DEFAULT 0,
    sending_chunk_size integer NOT NULL DEFAULT 0,
    steps_per_tick integer NOT NULL DEFAULT 0,
    track_shots boolean NOT NULL DEFAULT false,
    tracked_ai boolean NOT NULL DEFAULT false,
    tracked_sides text[] NOT NULL,
    tracked_vehicles boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id)
);
