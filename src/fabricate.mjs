// only required for dev
// in prod, foundry loads fabricate.mjs, which is compiled by vite/rollup
// in dev, foundry loads fabricate.mjs, this file, which loads lancer.ts

window.global = window;
import * as FABRICATE from "./fabricate.ts";