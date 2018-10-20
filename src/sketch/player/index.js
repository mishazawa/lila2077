import { Renderable } from './../interfaces/Renderable';
import { Animation } from './../animation';
import { Seq } from './../animation/seq';
import { TILE_SIZE, PLAYER_STATE } from "../constant";

export class Player extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
    this.spot = 0;
    this.rest = 0;
    this.state = PLAYER_STATE.idle;
    // this.current = [];
    this.offset = 0;
    this.currentFrame = 0;
    this.frameCount = 0;

    this.sequence = new Seq(renderer, {
      framerate: 4,
      sequence: [0, 1, 2, 3, 4],
      skin: this.skin,
    });
  }

  move () {
    this.rest -= 1;
    this.spot += 1;
    this.spotCoords = this.tiles[this.spot].coords();
    if (this.spot !== 99) {
      this.nextSpotCoords = this.tiles[this.spot + 1].coords();
    } else {
      this.state = PLAYER_STATE.stop;
    }
    if (this.rest === 0) {
      this.state = PLAYER_STATE.stop;
    }
  }

  preTp (type) {
    this.state = PLAYER_STATE.pretp;
    this.tpType = type;
    this.tpDir = 1;

    const coords = this.tiles[this.spot].coords();
    this.renderer.push();
    this.renderer.translate(coords.x, coords.y);
    this.renderer.image(this[type][this.currentFrame], 0, 0);

    if (this.currentFrame === this[type].length - 1) {
      this.state = PLAYER_STATE.tp;
      this.currentFrame = 0;
    } else {
      if (this.renderer.frameCount % 4 === 0) {
        this.currentFrame++;
      }
    }

    this.renderer.pop();
  }

  postTp () {
    this.state = PLAYER_STATE.posttp;
    this.tpDir = -1;
    const coords = this.tiles[this.spot].coords();
    this.renderer.push();
    this.renderer.translate(coords.x, coords.y);
    this.renderer.image(this[this.tpType][this.currentFrame], 0, 0);
    if (this.currentFrame === this[this.tpType].length - 1) {
      this.state = PLAYER_STATE.idle;
      this.currentFrame = 0;
    } else {
      if (this.frameCount % 4 === 0) {
        this.currentFrame++;
      }
    }
    this.renderer.pop();
  }

  teleport () {
    const tile = this.tiles[this.spot];
    this.spot = tile.next;
    this.state = PLAYER_STATE.posttp;
  }

  render (n = 0) {
    const { x, y, direction } = this.tiles[this.spot].coords();
    this.renderer.push()
    this.renderer.translate(x + (this.offset * direction), y);
    this.renderer.scale(direction, 1);
    if (direction == -1) this.renderer.translate(-TILE_SIZE, 0);
    this.renderer.image(this.skin[n][this.currentFrame], 0, 0)
    if (this.currentFrame === this.skin[n].length - 1) {
      // this.state = PLAYER_STATE.idle;
      this.currentFrame = 0;
    } else {
      if (this.frameCount % 4 === 0) {
        this.currentFrame++;
      }
    }
    this.renderer.pop()
  }
}
