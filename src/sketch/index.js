import {
  FIELD_SIZE,
  TILE_SIZE,
  FIELD_OFFSET,
  GAME_STATE,
  FRAMERATE,
  ANIMATION_SPEED_SKY,
  PLAYER_STATE,
  } from './constant';

import { Field } from './field';
import { Player } from './player';
import { Animation } from './animation';
import { Polling } from './../service';
import { Ufo } from './ufo';
// assets
import proto1 from './assets/stairs.png';
import pers1  from './assets/pers1.png';

// animated
import bg02a from './assets/bg-02a.png';
import bg04a from './assets/bg-04a.png';
import bg06a from './assets/bg-06a.png';

//static
import bg01 from './assets/bg-01.png';
import bg03 from './assets/bg-03.png';
import bg05 from './assets/bg-05.png';
import bg07 from './assets/bg-07.png';
import bg08 from './assets/bg-08.png';

import green_in_anim from './assets/green_in_anim.png';
import green_light from './assets/green_light.png';
import green_mask_anim from './assets/green_mask_anim.png';
import portal_idle from './assets/idle.png';
import red_in_anim from './assets/red_in_anim.png';
import red_light from './assets/red_light.png';
import red_mask_anim from './assets/red_mask_anim.png';

import pink_idle_4fps from './assets/pink-idle-4fps.png'
import pink_walk_8fps from './assets/pink-walk-8fps.png'

import yell_walk_15fps from './assets/yell-walk-15fps.png';
import yell_idle_4fps from './assets/yell-idle-4fps.png';

import ufo_sprite from './assets/tarelka-15fps.png';

const game = {
  polling: null,
  players: [],
  background: null,
  animation: {
    layers: [1, 3, 6],
    portal_green: [],
    portal_red: [],
    green_mask_anim: [],
    red_mask_anim: [],
    yell_walk: [],
    yell_idle: [],
    ufo_end: []
  },
  layers: [],
  counter: 0,
  status: GAME_STATE.waitingForRoll,
  state: {},
  lastRoll: {},
  ufo: null
}

function loadSprite(file, name) {
  this.loadImage(file, (img) => {
    const times = img.width / TILE_SIZE;
    game.animation[name] = [];
    for (let i = 0; i < times; i++) {
      game.animation[name].push(img.get(TILE_SIZE * i, 0, TILE_SIZE, TILE_SIZE));
    }
  });
}

export const preload = function () {
  game.layers = [bg01, bg02a, bg03, bg04a, bg05, bg06a, bg07, bg08, proto1].map(layer => this.loadImage(layer));

  game.animation.idle = this.loadImage(portal_idle);
  game.animation.green_light = this.loadImage(green_light);
  game.animation.red_light = this.loadImage(red_light);

  loadSprite.call(this, green_in_anim, 'portal_green');
  loadSprite.call(this, red_in_anim, 'portal_red');
  loadSprite.call(this, green_mask_anim, 'green_mask_anim');
  loadSprite.call(this, red_mask_anim, 'red_mask_anim');

  // characters
  loadSprite.call(this, yell_walk_15fps, 'yell_walk');
  loadSprite.call(this, yell_idle_4fps, 'yell_idle');
  loadSprite.call(this, pink_idle_4fps, 'pink_idle');
  loadSprite.call(this, pink_walk_8fps, 'pink_walk');


  // ad - hoc
  this.loadImage(ufo_sprite, (img) => {
    const times = img.width / 96;
    for (let i = 0; i < times; i++) {
      game.animation.ufo_end.push(img.get(96 * i, 0, 96, 64));
    }
  })

}

export const setup = function () {
  this.createCanvas(FIELD_SIZE + TILE_SIZE * 2, FIELD_SIZE + TILE_SIZE * 2);
  this.frameRate(FRAMERATE);
  this.noSmooth();

  // game.polling = new Polling();
  game.field = new Field(this, {
    portal_green: game.animation.portal_green,
    portal_red: game.animation.portal_red,
    red_light: game.animation.red_light,
    green_light: game.animation.green_light,
    idle: game.animation.idle
  });
  game.field.create();

  game.ufo = new Ufo(this, {
    skin: game.animation.ufo_end,
  });

  game.layers = game.layers.map((layer) => {
    return new Animation(this, {
      layer,
      position: {
        x: 0,
        y: 0
      },
      update () {

      },
      render () {
        if (this.position.x >= this.layer.width) this.position.x = 0;
        if (this.position.x > 0) this.renderer.image(this.layer, this.position.x - this.layer.width, 0);
        this.renderer.image(this.layer, this.position.x, 0);
      }
    })
  });

  [game.layers[1], game.layers[3], game.layers[5]].forEach((layer, i) => {
    layer.update = function () {
      this.position.x += game.animation.layers[i] * ANIMATION_SPEED_SKY;
    }
  });
  const skins = [
    [game.animation.yell_idle, game.animation.yell_walk],
    [game.animation.pink_idle, game.animation.pink_walk]
    ];

  game.polling = new Polling();
  game.polling.connect().then(game.polling.start);

  game.polling.listen('status', (data) => {
    console.log(data);
    if (data.status === 'started') {
      data.players.forEach((player, i) => {
        if (skins[i]) {
          game.players.push(new Player(this, {
            tiles: game.field.tiles,
            skin: skins[i],
            id: i,
            username: player.username,
            green_mask: game.animation.green_mask_anim,
            red_mask: game.animation.red_mask_anim
          }));
        }
      });
    }
    if (data.status === 'roll') {
      game.players.forEach((player) => {
        if (player.username === data.current.username) {
          player.rest = data.current.roll;
          player.state = PLAYER_STATE.moving;
          player.frameCount = 0;
        };
      })
    }

    if (data.status === 'game over') {
      console.log('to be implemented.');
    }

    game.polling.start();
  });

  game.polling.listen('roll', ({data, errors}) => {
    console.log(data)
    if (game.players[game.lastRoll.player] && game.players[game.lastRoll.player].state !== PLAYER_STATE.idle) return;
    game.lastRoll = data;
    game.players[game.lastRoll.player].rest = data.roll;
    game.players[game.lastRoll.player].state = PLAYER_STATE.moving;
    game.players[game.lastRoll.player].frameCount = 0;
    game.counter++;
  });

}



export const draw = function () {
  game.layers.forEach(l => l.play());
  // add offset to everything
  this.push();
  this.translate(FIELD_OFFSET, FIELD_OFFSET + 1);
  game.field.render();

  const p = game.players[0];
  game.players.forEach((player) => {
    if (player.dead) return;
    if (game.status === GAME_STATE.gameOver) {
      if (player.spot === 99 && game.ufo.currentFrame < 5) {
        player.render();
      } else {
        player.dead = true;
      }
    }

    player.frameCount++;

    if (player.state === PLAYER_STATE.idle) {
      player.render();
    }

    if (player.spot === 99) {
      player.spot = 99;
      player.render();
      game.status = GAME_STATE.gameOver;
      game.ufo.state = null;
      return;
    }

    if (player.state === PLAYER_STATE.moving) {
      if (player.frameCount % 5 === 0) {
        player.offset = 0;
        player.move();
      } else {
        player.offset += TILE_SIZE / 5;
      }
      player.render(1);
    }

    if (player.state === PLAYER_STATE.stop) {
      if (player.tiles[player.spot].snake || player.tiles[player.spot].ladder) {
        player.state = PLAYER_STATE.pretp;
      } else {
        player.state = PLAYER_STATE.idle;
      }
    }

    if (player.state === PLAYER_STATE.pretp) {
      player.preTp(player.tiles[player.spot].snake ? 'red_mask' : 'green_mask');
    }

    if (player.state === PLAYER_STATE.tp) {
      player.teleport();
    }

    if (player.state === PLAYER_STATE.posttp) {
      player.postTp();
    }
  });

  if (game.status === GAME_STATE.gameOver) {
    return game.ufo.render(() => {
      game.layers.pop();
    });
  }

  if (game.ufo.state === "NORENDER") {

  } else {
    game.ufo.render();

  }
  this.pop();
}


function rollRandom () {
  game.polling.emitter.emit('roll', { data: { roll: Math.floor(Math.random() * 6) + 1, player: game.counter % game.players.length}})
}

document.querySelector('#test-roll').addEventListener('click', (e) => {
  rollRandom();
});

document.addEventListener('keydown', function (e) {
  if (e.keyCode === 49) {
    window.location.reload();
  } else if (e.keyCode === 50) {
    rollRandom();
  }
});
