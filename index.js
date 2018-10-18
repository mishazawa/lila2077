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
  if (!req.params.id && !req.params.body) return res.sendStatus(400);
  mainState.games[req.params.id].players.push(req.body);

  // console.log(JSON.stringify(mainState, null, 2))
  return res.json(rmListenersToSend(req.params.id));
});

app.post('/game/:id/start', (req, res) => {
  if (!req.params.id && !req.params.body) return res.sendStatus(400);
  const game = mainState.games[req.params.id];
  const haveTv = game.players.some(p => p.isTv);
  if (!haveTv) {
    return res.json({
      error: `can't start game without tv... open game on tv`,
    });
  }
  const players = game.players.filter(p => !p.isTv).length;
  game.status = 'started';
  game.q = new Queue(players);

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
    emitter.emit(STATE_ROLL, { gameId: game.gameId, roll: number, player });

    // console.log(mainState)
    return res.sendStatus(200);
  }

  return res.sendStatus(403);
});

emitter.on(STATE_FINISH, (data) => {
  mainState.games[data.gameId].listeners.forEach((res) => res.json(data))
  mainState.games[data.gameId].listeners = [];
});

emitter.on(STATE_START, (data) => {
  mainState.games[data.gameId].listeners.forEach((res) => res.json(data));
  mainState.games[data.gameId].listeners = [];
});

emitter.on(STATE_ROLL, (data) => {
  const next = mainState.games[data.gameId].q.next();
  const players = {
    current: mainState.games[data.gameId].players[data.player],
    next: mainState.games[data.gameId].players[next.next]
  };
  emitter.emit(STATE_FINISH, Object.assign({}, data, next, { players }, { status: 'roll' }));
});


app.use('/', express.static(__dirname + '/build'))
const server = require('http').createServer(app);

server.listen(7654, () => {
  console.log('server on. 7654')
});
