import CONSTANTS from './constants';
import { debug, isGMConnected } from './lib/lib';
import { checkSystem } from './settings';
import { registerSocket } from './socket';
import API from './api';

const prefix =
  (str) =>
  (strs, ...exprs) =>
    `${str}-${strs.reduce((a, c, i) => a + exprs[i - 1] + c)}`;
const module = prefix(CONSTANTS.MODULE_NAME);

const HOOKS = {
  READY: module`ready`,
  // TODO
};

export default HOOKS;
