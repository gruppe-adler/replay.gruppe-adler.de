# replay.gruppe-adler.de

This is the replay API of Gruppe Adler. It holds and therefore also serves all replay data (actual data where which unit was etc.). It is used by [aar.gruppe-adler.de](https://github.com/gruppe-adler/aar.gruppe-adler.de) and [grad_replay_intercept](https://github.com/gruppe-adler/grad_replay_intercept).

## Setup & Configuration
A docker image is available on [Docker Hub](https://hub.docker.com/r/gruppeadler/replay).  
- The container obviously should be reachable via Port 80/443.  
- The authorization token can be configured via the environment variable `AUTH_TOKEN`. The default value is `MEH`.

## Authorization
Some endpoints require Authorization. Just set the `Authorization` HTTP header with value `Bearer <AUTH_TOKEN>`. For an explanation on how to configure the AUTH_TOKEN see [Setup & Configuration](#Setup-&-Configuration).

## Endpoints
### GET `/`
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
        "id":0
    },
    // [...]
]
```

### GET `/:id`
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
    "data": {
        "config": {
            "precision": 1,
            "sendingChunkSize": 10,
            "stepsPerTick": 1,
            "trackShots": true,
            "trackedAI": true,
            "trackedSides": ["west", "east", "civilian"],
            "trackedVehicles": true
        },
        "replay": [
            {
                "data": [
                    {
                        "color": "rgba(0,76,153,1)",
                        "direction": 111,
                        "group": " (Alpha 1-1)",
                        "icon": "iconMan",
                        "name": "Willard",
                        "position": [1900.7523193359375, 5695.95556640625]
                    }, {
                        "color": "rgba(127,0,0,1)",
                        "direction": 10,
                        "group": " (Alpha 1-1)",
                        "icon": "unknown",
                        "name": "Hussein Bahadur",
                        "position": [2603.489990234375, 5460.224609375]
                    }, {
                        "color": "rgba(0,76,153,1)",
                        "direction": 0,
                        "group": " (Alpha 1-2)",
                        "icon": "iconMan",
                        "name": "Ryan Price",
                        "position": [1615.6707763671875, 5179.10498046875]
                    }, {
                        "color": "rgba(0,76,153,1)",
                        "direction": 312,
                        "group": " (Alpha 1-3)",
                        "icon": "unknown",
                        "name": "Jack Davis",
                        "position": [3481.974853515625, 5346.24169921875]
                    }
                ],
                "time": "12:00:06"
            },
            // [...]
        ]
    }
}
```

### DELETE `/:id`
`Description`: Deletes replay with given id.  
`Requires Authorization?`: Yes  


### POST `/`
`Description`: Creates new replay.  
`Requires Authorization?`: Yes  
`Example Request Body`: 
```jsonc
// n/a
```