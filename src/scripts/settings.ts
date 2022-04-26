import CONSTANTS from "./constants";
import { dialogWarning, warn } from "./lib/lib";
import { SYSTEMS } from "./systems";

export const registerSettings = function (): void {

  game.settings.registerMenu(CONSTANTS.MODULE_NAME, 'resetAllSettings', {
    name: `${CONSTANTS.MODULE_NAME}.setting.reset.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.reset.hint`,
    icon: 'fas fa-coins',
    type: ResetSettingsDialog,
    restricted: true,
  });

  // =====================================================================

  // TODO ADD SOME SETTING

  // ========================================================================

  game.settings.register(CONSTANTS.MODULE_NAME, 'debug', {
    name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'debugHooks', {
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'systemFound', {
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown', {
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'preconfiguredSystem', {
    name: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.hint`,
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  // const settings = defaultSettings();
  // for (const [name, data] of Object.entries(settings)) {
  //   game.settings.register(CONSTANTS.MODULE_NAME, name, <any>data);
  // }

  // for (const [name, data] of Object.entries(otherSettings)) {
  //     game.settings.register(CONSTANTS.MODULE_NAME, name, data);
  // }
};

class ResetSettingsDialog extends FormApplication<FormApplicationOptions, object, any> {
  constructor(...args) {
    //@ts-ignore
    super(...args);
    //@ts-ignore
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.title`),
      content:
        '<p style="margin-bottom:1rem;">' +
        game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.content`) +
        '</p>',
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.confirm`),
          callback: async () => {
            await applyDefaultSettings();
            window.location.reload();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.cancel`),
        },
      },
      default: 'cancel',
    });
  }

  async _updateObject(event: Event, formData?: object): Promise<any> {
    // do nothing
  }
}

async function applyDefaultSettings() {
  // const settings = defaultSettings(true);
  // for (const [name, data] of Object.entries(settings)) {
  //   await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
  // }
  const settings2 = otherSettings(true);
  for (const [name, data] of Object.entries(settings2)) {
    //@ts-ignore
    await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
  }
}

// function defaultSettings(apply = false) {
//   return {
//     // TODO
//   };
// }

function otherSettings(apply = false) {
  return {
    debug: {
      name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
      scope: 'client',
      config: true,
      default: false,
      type: Boolean,
    },

    debugHooks: {
      name: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    systemFound: {
      name: `${CONSTANTS.MODULE_NAME}.setting.systemFound.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.systemFound.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    systemNotFoundWarningShown: {
      name: `${CONSTANTS.MODULE_NAME}.setting.systemNotFoundWarningShown.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.systemNotFoundWarningShown.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    preconfiguredSystem: {
      name: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    // =======================================

    // TODO
  };
}

export async function checkSystem() {
  if (!SYSTEMS.DATA) {
    if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown')) return;

    await game.settings.set(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown', true);

    return Dialog.prompt({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.nosystemfound.title`),
      content: dialogWarning(game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.nosystemfound.content`)),
      callback: () => {},
    });
  }

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemFound')) return;

  game.settings.set(CONSTANTS.MODULE_NAME, 'systemFound', true);

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown')) {
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.title`),
      content: warn(game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.content`), true),
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.confirm`),
          callback: () => {
            applyDefaultSettings();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('No'),
        },
      },
      default: 'cancel',
    }).render(true);
  }

  return applyDefaultSettings();
}
