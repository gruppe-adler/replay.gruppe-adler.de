-- Your SQL goes here
CREATE TABLE frame
(
    id serial,
    id_replay serial NOT NULL,
    "time" character(8) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT id_replay FOREIGN KEY (id_replay)
        REFERENCES public.replay (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);
