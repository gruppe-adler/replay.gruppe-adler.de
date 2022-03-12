-- Your SQL goes here
CREATE TABLE record
(
    id serial,
    id_frame serial NOT NULL,
    color real[] NOT NULL,
    direction real NOT NULL,
    "group" text NOT NULL,
    icon text NOT NULL,
    name text NOT NULL,
    "position" real[] NOT NULL,
    target real[] NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT id_frame FOREIGN KEY (id_frame)
        REFERENCES public.frame (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);