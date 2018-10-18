import { Renderable } from './../interfaces/Renderable';
import { TILE_SIZE } from './../constant';

export class Ufo extends Renderable {
  constructor (...props) {
    super(...props);
    this.state = "IDLE";
    this.offset = this.renderer.random(-5, 5);
    this.currentFrame = 0;
    this.frameCount = 0;
  }

  render () {
    if (this.state === "NORENDER") return;
    if (this.state) {
      if (this.renderer.frameCount % 50 === 0) {
        this.offset = this.renderer.random(1, 5);
      }
      this.renderer.push();
      this.renderer.translate(-TILE_SIZE + this.offset, -TILE_SIZE + this.offset);
      this.renderer.image(this.skin[this.currentFrame], 0, 0);
      this.renderer.pop();
    } else {
      this.frameCount++;
      this.renderer.push();
      this.renderer.translate(-TILE_SIZE, -TILE_SIZE);
      this.renderer.image(this.skin[this.currentFrame], 0, 0);
      this.renderer.pop();
      if (this.currentFrame < this.skin.length - 1) {
        if (this.frameCount % 15 === 0) {
          this.currentFrame++;
        }
      } else {
        this.currentFrame = 0;
        // this.renderer.noLoop();
        this.state = "NORENDER"
      }
    }
  }
}
