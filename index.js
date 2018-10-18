const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const uuid = require('uuid/v4');

const { PollEmitter, Queue } = require("./queue");
const { STATE_ROLL, STATE_FINISH, STATE_START } = require("./constants");

// setup
const emitter = new PollEmitter();

// server
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());

function rmListenersToSend (id) {
  return Object.assign({}, mainState.games[id], { listeners: null })
}

const mainState = {
  games: {

  },
};

function newGame (gameId) {
  return {
    gameId,
    status: 'new',
    haveTv: false,
    players: [],
    listeners: [],
  };
}

app.post('/game/create', (req, res) => {
  const gameId = process.env.DEBUG_ID === "1" || uuid();
  mainState.games[gameId] = newGame(gameId);
  // console.log(JSON.stringify(mainState, null, 2))
  return res.json({ gameId });
});

app.post('/game/:id/connect', (req, res) => {
  if (!req.params.id && !req.body) return res.sendStatus(400);

  if (req.body.isTv) {
    mainState.games[req.params.id].haveTv = true;
  } else {
    mainState.games[req.params.id].players.push(req.body);
  }
  return res.json(rmListenersToSend(req.params.id));
});

app.post('/game/:id/start', (req, res) => {
  if (!req.params.id && !req.body) return res.sendStatus(400);
  const game = mainState.games[req.params.id];
  if (!game.haveTv) {
    return res.json({
      error: `can't start game without tv... open game on tv`,
    });
  }
  game.status = 'started';
  game.q = new Queue(game.players.length);

  emitter.emit(STATE_START, rmListenersToSend(req.params.id));
  // console.log(JSON.stringify(mainState, null, 2))
  return res.json({
    gameId: game.gameId,
    pollingUrl: `/game/${game.gameId}/state`,
    rollUrl: `/game/${game.gameId}/roll`,
  });
});

app.get('/game/:id/state', (req, res) => {
  mainState.games[req.params.id].listeners.push(res);
});

app.post("/game/:id/roll", (req, res) => {
  const game = mainState.games[req.params.id];

  if (!game) res.sendStatus(400);

  if (game.listeners.length) {
    const { number, player } = req.body;
    return emitter.emit(STATE_ROLL, { gameId: game.gameId, current: { roll: number, username: player }}, res);
  }

  return res.sendStatus(403);
});

emitter.on(STATE_FINISH, (data, res) => {
  res.json(data);
  mainState.games[data.gameId].listeners.forEach((res) => res.json(data))
  mainState.games[data.gameId].listeners = [];
});

emitter.on(STATE_START, (data) => {
  mainState.games[data.gameId].listeners.forEach((res) => res.json(data));
  mainState.games[data.gameId].listeners = [];
});

emitter.on(STATE_ROLL, (data, res) => {
  const next = mainState.games[data.gameId].q.next();


  emitter.emit(STATE_FINISH,
    Object.assign({},
      data,
      { next: mainState.games[data.gameId].players[next.next] },
      { status: 'roll' }), res);
});


app.use('/', express.static(__dirname + '/build'))
const server = require('http').createServer(app);

server.listen(7654, () => {
  console.log('server on. 7654')
});
