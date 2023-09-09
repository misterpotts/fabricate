import Properties from "../Properties";
import {GameProvider} from "../foundry/GameProvider";

interface SettingsRegistry {

    clearAll(): Promise<void>;

    registerAll(): void;

}

export { SettingsRegistry };

class DefaultSettingsRegistry implements SettingsRegistry {

    private static readonly DEFAULT_SETTING_KEYS = [
        Properties.settings.craftingSystems.key,
        Properties.settings.essences.key,
        Properties.settings.components.key,
        Properties.settings.recipes.key,
        Properties.settings.modelVersion.key,
    ];

    private readonly _clientSettings: ClientSettings;
    private readonly _gameProvider: GameProvider;
    private readonly _settingKeys: string[];
    private readonly _defaultValuesBySettingKey: Map<string, any>;

    constructor({
        settingKeys = DefaultSettingsRegistry.DEFAULT_SETTING_KEYS,
        gameProvider,
        clientSettings,
        defaultValuesBySettingKey = new Map<string, any>(),
    }: {
        settingKeys?: string[];
        gameProvider: GameProvider;
        clientSettings: ClientSettings;
        defaultValuesBySettingKey?: Map<string, any>;
    }) {
        this._settingKeys = settingKeys;
        this._gameProvider = gameProvider;
        this._clientSettings = clientSettings;
        this._defaultValuesBySettingKey = defaultValuesBySettingKey;
    }

    async clearAll(): Promise<void> {
        await Promise.all(this._settingKeys.map(async settingKey => await this._clearSetting(settingKey)));
    }

    registerAll(): void {
        this._settingKeys.map(async settingKey => this._registerSetting(settingKey));
    }

    private _registerSetting(settingKey: string) {
        const gameObject = this._gameProvider.get();
        gameObject.settings.register(Properties.module.id, settingKey, {
            name: "",
            hint: "",
            scope: "world",
            config: false,
            type: Object,
            default: this._defaultValuesBySettingKey.has(settingKey) ? this._defaultValuesBySettingKey.get(settingKey) : {}
        });
    }

    private async _clearSetting(settingKey: string) {
        const setting = this._clientSettings.storage.get("world").getSetting(settingKey);
        await setting.delete();
    }

}

export { DefaultSettingsRegistry };