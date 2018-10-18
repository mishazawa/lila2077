export const FIELD_OFFSET = 32;
export const FIELD_SIZE = 320;
export const TILE_SIZE  = 32;
export const FRAMERATE = 60;
export const ANIMATION_SPEED_SKY = 0.02;
export const TILE_MAP = [

]

export const IGNORED_TILES = [11, 21, 32, 43, 54, 65, 76, 87, 98, 110];

export const PATHS = [
  [8, 26],
  [21, 82],
  [43, 77],
  [50, 91],
  [54, 93],
  [62, 96],
  [66, 87],
  [80, 100],
  // snakes
  [98, 28],
  [95, 24],
  [92, 51],
  [83, 19],
  [73, 1],
  [69, 9],
  [64, 36],
  [59, 17],
  [55, 7],
  [52, 11],
  [48, 9],
  [46, 5],
  [44, 22],
]

export const GAME_STATE = {
  waiting: 0,
  rolling: 1,
  moving: 2,
  teleporting: 3,
  error: 4,
  searchingGame: 5,
  waitingForRoll: 6,
  gameOver: 7,
  moveEnd: 8,
}

export const PLAYER_STATE = {
  idle: 0,
  moving: 1,
  pretp: 2,
  tp: 3,
  posttp: 4,
  stop: 5,
  step: 6
}


