db.createUser(
    {
        user: "replayservice",
        pwd: "replayservice",
        roles: [
            {
                role: "readWrite",
                db: "replayservice"
            }
        ]
    }
);