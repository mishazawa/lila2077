const EventEmitter = require("events");

class PollEmitter {
  constructor () {
    this.emitter = new EventEmitter();
  }

  emit (...args) {
    this.emitter.emit(...args);
  }

  on (...args) {
    this.emitter.on(...args);
  }
}


class Queue {
  constructor (numberOfPlayers) {
    this.players = numberOfPlayers;
    this.count = 0;
    this.current = 0;
  }

  next () {
    this.count += 1;
    this.current = this.count % this.players;
    return { next: this.current };
  }

  getCurrent () {
    return this.current;
  }

}

module.exports = {
  PollEmitter,
  Queue,
};
