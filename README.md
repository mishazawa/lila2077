### API

#### Create new game

**POST** `/game/create` 

##### response

```json

{
    "gameId": <uuid of game>
}

```

#### Connect to game

**POST** `/game/:id/connect`

```json 
{
  "username": <name of user>,
  "isTv": <required only for tv>
}
```
##### response

```json
{
    "gameId": <uuid of game>,
    "status": "new",
    "haveTv": <true or false>
    "players": [
        {
            "username": <name of user>,
            "isTv": false
        }
    ],
    "listeners": []
}
```

#### Start game

**POST** `/game/:id/start`

##### response

```json
{
    "gameId": <uuid of game>,
    "pollingUrl": "/game/<uuid of game>/state", 
    "rollUrl": "/game/<uuid of game>/roll"
}
```

#### Polling 

**GET** `/game/:id/state`

##### response

```json
{
    "gameId": <uuid of game>,
    "current": {
        "roll": <number 1-6>,
        "username": <name of user>
    },
    "next": {
        "username": <name of user>,
        "isTv": false
    },
    "status": "roll"
}
```

#### Roll die

**POST** `/game/:id/roll`

```json
{
	"player": <queue number or username>,
	"number": <roll number>
}
```

##### response

same as in polling or Forbidden if nobody listen state event (nobody poll)
