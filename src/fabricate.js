// only required for dev
// in prod, foundry loads fabricate.js, which is compiled by vite/rollup
// in dev, foundry loads fabricate.js, this file, which loads lancer.ts

window.global = window;
import * as FABRICATE from "./fabricate.ts";