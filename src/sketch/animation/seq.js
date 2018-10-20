import { Renderable } from './../interfaces/Renderable';

export class Seq extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
    this.currentFrame = 0;
    this.frameCount = 0;
    this.fps = this.renderer.getFrameRate() / this.framerate;
  }

  play (state) {
    if (this.frameCount % this.fps === 0) {
      if (this.sequence.length === this.currentFrame) this.currentFrame = 0
      this.renderer.image(this.skin[state][this.sequence[this.currentFrame++]], 0, 0);
    }
    this.frameCount++;
  }
}
