import { EventEmitter } from './eventEmitter';

export const API_STATES = {
  create: '/create',
  connect: '/connect',

}

export class Polling {
  constructor () {
    this.emitter = new EventEmitter();
    this.gameId = '';
    this.endpoint = '/game';
    this.start = this.start.bind(this);
  }

  listen (event, fn) {
    this.emitter.on(event, fn);
  }

  start () {
    this.send().then((data) => {
      this.emitter.emit('status', data);
    });
  }

  makeUrl (state) {
    return `${this.endpoint}${this.gameId ? '/' + this.gameId : '' }${state}`;
  }

  flushId () {
    this.gameId = '';
  }

  ajax (state, method, data) {
     return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, this.makeUrl(state), true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          resolve(JSON.parse(xhr.responseText));
        }
      }

      xhr.onerror = function () {
        resolve({});
      };
      xhr.send(JSON.stringify(data));
    });
  }

  connect (cb) {
    return this.ajax(API_STATES.create, 'POST', {}).then((data) => {
      cb(data);
      this.gameId = data.gameId;
      return {
        name: 'game_display',
        isTv: true,
      };
    }).then((data) => {
      return this.ajax(API_STATES.connect, 'POST', data);
    })
  }

  send (state = '/state') {
    return this.ajax(state, 'GET', {});
  }
}
