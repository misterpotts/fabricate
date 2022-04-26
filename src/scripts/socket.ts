import CONSTANTS from './constants';
import API from './api';
import { debug } from './lib/lib';
import { setSocket } from '../fabricate';

export const SOCKET_HANDLERS = {
  // TODO socket handler like in item-piles modules
};

export let fabricateSocket;

export function registerSocket() {
  debug('Registered fabricateSocket');
  if (fabricateSocket) {
    return fabricateSocket;
  }
  //@ts-ignore
  fabricateSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);

  // TODO add some socket function like in item-piles modules

  setSocket(fabricateSocket);
  return fabricateSocket;
}