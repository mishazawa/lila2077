const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const uuid = require('uuid/v4');
const QRCode = require('qrcode');

const { PollEmitter, Queue } = require("./queue");
const { STATE_ROLL, STATE_FINISH, STATE_START, STATE_CONNECT } = require("./constants");

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
    allowToJoinAfterStart: false,
    haveTv: false,
    players: []
  };
}

app.post('/game/create', (req, res) => {
  const gameId = process.env.DEBUG_ID === "1" || uuid();
  mainState.games[gameId] = newGame(gameId);
  QRCode.toDataURL(gameId.toString(), {
    color: {
      dark: '#00F',  // Blue dots
      light: '#0000' // Transparent background
    }
  }).then((qr) => {
    return res.json({ gameId, qr, status: 'new' });
  }).catch((err) => {
    return res.sendStatus(500);
  })
});

app.post('/game/:id/connect', (req, res) => {
  if (!req.params.id || !req.body) return res.sendStatus(400);
  const game = mainState.games[req.params.id];

  if (!game) return res.sendStatus(404);
  if (game.status === 'started' && game.allowToJoinAfterStart !== true) {
    return res.json({
      error: 'Can\'t join game after start'
    });
  }

  if (req.body.isTv) {
    game.haveTv = true;
  } else {
    game.players.push(req.body);
    if (game.status === 'started') {
      game.q.players += 1;
    }
    emitter.emit(STATE_CONNECT, { ...game, status: 'connected', new: req.body });
  }

  return res.json(mainState.games[req.params.id]);
});

app.post('/game/:id/start', (req, res) => {
  if (!req.params.id || !req.body) return res.sendStatus(400);
  const game = mainState.games[req.params.id];
  if (!game.haveTv) {
    return res.json({
      error: `Can't start game without TV... Open game on TV`,
    });
  }
  game.status = 'started';
  game.allowToJoinAfterStart = req.body.allowToJoinAfterStart;
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
    emitter.off(STATE_FINISH, fn);
    emitter.off(STATE_START, fn);
    emitter.off(STATE_CONNECT, fn);
    return res.json({});
  }, 25000);
  emitter.once(STATE_FINISH, fn);
  emitter.once(STATE_START, fn);
  emitter.once(STATE_CONNECT, fn);
});

app.post("/game/:id/roll", (req, res) => {
  if (!req.params.id || !req.body) return res.sendStatus(400);

  const game = mainState.games[req.params.id];
  if (!game) return res.sendStatus(404);
  if (game.status !== 'started') return res.json({ error: 'Game is not started' });

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
