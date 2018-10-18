import * as p5 from 'p5';

import {
    setup,
    draw,
    preload,
} from "./sketch";

const sketch = (p) => {
    p.preload = preload && preload.bind(p);
    p.setup   = setup && setup.bind(p);
    p.draw    = draw && draw.bind(p);
};

new p5(sketch, "p5-canvas");
