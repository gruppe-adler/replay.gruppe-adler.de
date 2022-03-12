table! {
    frame (id) {
        id -> Int4,
        id_replay -> Int4,
        time -> Bpchar,
    }
}

table! {
    record (id) {
        id -> Int4,
        id_frame -> Int4,
        color -> Array<Float4>,
        direction -> Float4,
        group -> Text,
        icon -> Text,
        name -> Text,
        position -> Array<Float4>,
        target -> Array<Float4>,
    }
}

table! {
    replay (id) {
        id -> Int4,
        mission_name -> Text,
        mission_date -> Timestamp,
        duration -> Int4,
        world_name -> Text,
        frame_count -> Int8,
        precision -> Int4,
        sending_chunk_size -> Int4,
        steps_per_tick -> Int4,
        track_shots -> Bool,
        tracked_ai -> Bool,
        tracked_sides -> Array<Text>,
        tracked_vehicles -> Bool,
    }
}

joinable!(frame -> replay (id_replay));
joinable!(record -> frame (id_frame));

allow_tables_to_appear_in_same_query!(frame, record, replay,);
