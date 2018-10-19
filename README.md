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
    ]
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

`304 Not modified` after 25 sec of idle state of game 

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
	"username": <name of user>,
	"roll": <number 1-6>
}
```

##### response

OK or Forbidden if roll not in order
