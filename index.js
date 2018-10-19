const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const uuid = require('uuid/v4');
const QRCode = require('qrcode');

const { PollEmitter, Queue } = require("./queue");
const { STATE_ROLL, STATE_FINISH, STATE_START } = require("./constants");

// setup
const emitter = new PollEmitter();

// server
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());

const mainState = {
  games: {

  },
};

function newGame (gameId) {
  return {
    gameId,
    status: 'new',
    haveTv: false,
    players: []
  };
}

app.post('/game/create', (req, res) => {
  const gameId = process.env.DEBUG_ID === "1" || uuid();
  mainState.games[gameId] = newGame(gameId);
  QRCode.toDataURL(gameId.toString()).then((qr) => {
    return res.json({ gameId, qr });
  }).catch((err) => {
    return res.sendStatus(500);
  })
});

app.post('/game/:id/connect', (req, res) => {
  if (!req.params.id || !req.body) return res.sendStatus(400);

  if (req.body.isTv) {
    mainState.games[req.params.id].haveTv = true;
  } else {
    mainState.games[req.params.id].players.push(req.body);
  }
  return res.json(mainState.games[req.params.id]);
});

app.post('/game/:id/start', (req, res) => {
  if (!req.params.id || !req.body) return res.sendStatus(400);
  const game = mainState.games[req.params.id];
  if (!game.haveTv) {
    return res.json({
      error: `can't start game without tv... open game on tv`,
    });
  }
  game.status = 'started';
  game.q = new Queue(game.players.length);

  emitter.emit(STATE_START, mainState.games[req.params.id]);

  return res.json({
    gameId: game.gameId,
    pollingUrl: `/game/${game.gameId}/state`,
    rollUrl: `/game/${game.gameId}/roll`,
  });
});

app.get('/game/:id/state', (req, res) => {
  const fn = (data) => {
    clearTimeout(timer);
    return res.json(data);
  };

  const timer = setTimeout(() => {
    emitter.off(STATE_START, fn);
    emitter.off(STATE_FINISH, fn);
    return res.sendStatus(304);
  }, 25000);

  emitter.once(STATE_START, fn);
  emitter.once(STATE_FINISH, fn);
});

app.post("/game/:id/roll", (req, res) => {
  if (!req.params.id || !req.body) return res.sendStatus(400);

  const game = mainState.games[req.params.id];
  if (!game) res.sendStatus(404);

  const { roll, username } = req.body;
  const currentUser = game.players[game.q.current];

  if (currentUser.username !== username) return res.sendStatus(403);
  const next = game.q.next();

  emitter.emit(STATE_FINISH, {
    status: 'roll',
    gameId: game.gameId,
    next: game.players[next.next],
    current: { roll, username },
  });
  return res.sendStatus(200);
});



app.use('/', express.static(__dirname + '/build'))
const server = require('http').createServer(app);

server.listen(7654, () => {
  console.log('server on. 7654')
});
