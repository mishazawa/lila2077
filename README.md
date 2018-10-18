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
    "players": [
        {
            "username": <name of user>,
            "isTv": false
        },
        {
            "username": <name of tv>,
            "isTv": true
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
    "roll": <number 1-6>,
    "player": <current player>,
    "next": <next player>
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

`OK`
