import { Renderable } from './../interfaces/Renderable';

export class Animation extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
  }

  play (...args) {
    this.renderer.push();
    this.update(...args);
    this.render(...args);
    this.renderer.pop();
  }
}
