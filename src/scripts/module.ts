import { FabricateLifecycle } from './application/FabricateLifecycle';
import type { CraftingSystemSpecification } from './system/CraftingSystemSpecification';

import FabricateApplication from './application/FabricateApplication';
import { log } from 'console';
import { checkSystem } from './settings';
import { debug } from './lib/lib';
import CONSTANTS from './constants';
import { registerSocket } from './socket';
import HOOKS from './hooks';
import { CompendiumImportingCraftingSystemFactory, CraftingSystemFactory } from './crafting/CraftingSystemFactory';
import type { GameSystem } from './system/GameSystem';

Hooks.once('ready', loadCraftingSystems);
Hooks.once('ready', () => {
  FabricateLifecycle.init();
});

/**
 * Loads all Crafting Systems with a System Specification declared with the Crafting System Registry.
 * */
async function loadCraftingSystems(): Promise<void> {
  const systemSpecifications = FabricateApplication.systems.systemSpecifications;
  log(`${CONSTANTS.module.label} | Loading ${systemSpecifications.length} crafting systems. `);
  systemSpecifications.forEach(FabricateLifecycle.registerCraftingSystemSettings);
  systemSpecifications.forEach(loadCraftingSystem);
  const systemNames = systemSpecifications.map((systemSpec: CraftingSystemSpecification) => systemSpec.name);
  log(
    `${CONSTANTS.module.label} | Loaded ${systemSpecifications.length} crafting systems: ${systemNames.join(', ')} `,
  );
}

/**
 * Loads a single Crafting System from a System Specification, which must include a Compendium Pack Key. Item data from
 * the Compendium Pack is used to load the Recipes and Crafting Components into the system from the compendium. The
 * Fabricator, supported systems and name provided in the spec are all preserved.
 *
 * @param systemSpec `CraftingSystemSpecification` that determines how a system behaves and which compendium pack content
 * for the system should be loaded from.
 * */
async function loadCraftingSystem(systemSpec: CraftingSystemSpecification): Promise<void> {
  log(`${CONSTANTS.module.label} | Loading ${systemSpec.name} from Compendium pack ${systemSpec.id}. `);
  if (
    systemSpec.supportedGameSystems.some((gameSystem: GameSystem) => {
      Object.keys(gameSystem).includes(game.system.id);
    })
  ) {
    //if (systemSpec.supportedGameSystems.indexOf(game.system.id) < 0) {
    log(`${CONSTANTS.module.label} | ${systemSpec.name} does not support ${game.system.id}! `);
    return;
  }
  const craftingSystemFactory = <CraftingSystemFactory>new CompendiumImportingCraftingSystemFactory(systemSpec);
  const craftingSystem = await craftingSystemFactory.make();
  craftingSystem.enabled = game.settings.get(
    CONSTANTS.module.name,
    CONSTANTS.settingsKeys.craftingSystem.enabled(systemSpec.id),
  );
  FabricateApplication.systems.register(craftingSystem);
  log(`${CONSTANTS.module.label} | Loaded ${systemSpec.name}. `);
}

export const initHooks = (): void => {
  // registerSettings();
  // registerLibwrappers();

  Hooks.once('socketlib.ready', registerSocket);

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'debugHooks')) {
    for (const hook of Object.values(HOOKS)) {
      if (typeof hook === 'string') {
        Hooks.on(hook, (...args) => debug(`Hook called: ${hook}`, ...args));
        debug(`Registered hook: ${hook}`);
      } else {
        for (const innerHook of Object.values(hook)) {
          Hooks.on(<string>innerHook, (...args) => debug(`Hook called: ${innerHook}`, ...args));
          debug(`Registered hook: ${innerHook}`);
        }
      }
    }
  }
};

export const setupHooks = (): void => {
  //@ts-ignore
  setApi(API);
};

export const readyHooks = (): void => {
  checkSystem();
};

const module = {
  // TODO ADD SOME HOOKS
};
