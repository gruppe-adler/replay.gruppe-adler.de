# replay.gruppe-adler.de

This is the online replay service of Gruppe Adler. It holds and therefore also serves all replay data (actual data where which unit was etc.). It is used by [grad_replay_intercept](https://github.com/gruppe-adler/grad_replay_intercept).

## Setup & Configuration
A docker image is available on [Docker Hub](https://hub.docker.com/r/gruppeadler/replay).  
- The container obviously should be reachable via Port 80/443.  
- The authorization token can be configured via the environment variable `AUTH_TOKEN`. The default value is `MEH`.

## Development
To setup a development enviornment for the frontend just clone this repository, change into the `frontend` directory, install all dependencies with `npm install` and then start the development server with `npm run serve`.

## Authorization
Some endpoints require Authorization. Just set the `Authorization` HTTP header with value `Bearer <AUTH_TOKEN>`. For an explanation on how to configure the AUTH_TOKEN see [Setup & Configuration](#Setup-&-Configuration).

## Endpoints
### GET `api/`
`Description`: Returns array containing meta data of all replays.  
`Requires Authorization?`: No  
`Example Response`: 
```jsonc
[
    {
        "date": "2019-05-18 15:28:06",
        "duration":34,
        "missionName":"replayTest",
        "worldName":"Stratis",
        "id":0,
        "frameCount":30,
        "config": {
            "id":1,
            "precision":1,
            "sendingChunkSize":10,
            "stepsPerTick":1,
            "trackShots":true,
            "trackedAI":true,
            "trackedSides":["west","east","civilian"],
            "trackedVehicles":true
        }
    },
    // [...]
]
```

### GET `api/:id`
`Description`: Returns replay with given id.  
`Requires Authorization?`: No  
`Example Response`: 
```jsonc
{
    "date": "2019-05-18 15:28:06",
    "duration": 34,
    "missionName": "replayTest",
    "worldName": "Stratis",
    "id": 0,
    "frameCount":30,
    "config": {
        "precision": 1,
        "sendingChunkSize": 10,
        "stepsPerTick": 1,
        "trackShots": true,
        "trackedAI": true,
        "trackedSides": ["west", "east", "civilian"],
        "trackedVehicles": true
    }
}
```

### GET `api/:id/data/:offset/:amount`
`Description`: Returns data from replay with given id with given offset and given amount. So `/0/data/20/10` will return frames 20-29 from replay 0.
`Requires Authorization?`: No  
`Example Response`: 
```jsonc
[
    {
        "id": 51,
        "time": "12:00:28",
        "data": [
            {
                "id": 821,
                "color": "rgba(0,76,153,1)",
                "direction": 132,
                "group": " (Alpha 1-1)",
                "icon": "iconMan",
                "name": "Willard",
                "position": [
                    1946.40283203125,
                    5663.35107421875
                ],
                "target": null
            },
            // [...]
        ]
    },
    {
        "id": 52,
        "time": "12:00:29",
        "data": [
            {
                "id": 839,
                "color": "rgba(0,76,153,1)",
                "direction": 124,
                "group": " (Alpha 1-1)",
                "icon": "iconMan",
                "name": "Willard",
                "position": [
                    1949.318359375,
                    5663.4638671875
                ],
                "target": null
            },
            // [...]
        ]
    },
    // [...]
]
```

### DELETE `api/:id`
`Description`: Deletes replay with given id.  
`Requires Authorization?`: Yes  


### POST `api/`
`Description`: Creates new replay.  
`Requires Authorization?`: Yes  
`Example Request Body`: 
```jsonc
// n/a
```
