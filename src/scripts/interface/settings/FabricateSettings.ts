import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";

interface FabricateSetting<V> {
    version: string;
    value: V;
}

interface FabricateSettingMigrator<F, T> {
    fromVersion: string;
    toVersion: string;
    perform: (from: F) => T;
}

interface SettingsManager {

    read<T>(key: string): Promise<T>;

    write<T>(key: string, value: T): Promise<void>;

    delete<T>(key: string): Promise<T>;

    asVersionedSetting<T>(value: T, key: string): FabricateSetting<T>;
}

class DefaultSettingsManager implements SettingsManager {

    private readonly _moduleId: string;
    private readonly _gameProvider: GameProvider;
    private readonly _settingsMigrators: Map<string, FabricateSettingMigrator<any, any>>;
    private readonly _targetVersionsByRootSettingKey: Map<string, string>;

    constructor({
        moduleId = Properties.module.id,
        gameProvider = new GameProvider(),
        settingsMigrators = new Map(),
        targetVersionsByRootSettingKey = new Map()
    }: {
        moduleId?: string;
        gameProvider?: GameProvider;
        settingsMigrators?: Map<string, FabricateSettingMigrator<any, any>>;
        targetVersionsByRootSettingKey?: Map<string, string>;
    }) {
        this._moduleId = moduleId;
        this._gameProvider = gameProvider;
        this._settingsMigrators = settingsMigrators;
        this._targetVersionsByRootSettingKey = targetVersionsByRootSettingKey;
    }

    asVersionedSetting<T>(value: T, key: string): FabricateSetting<T> {
        return {
            value,
            version: this._targetVersionsByRootSettingKey.get(key)
        };
    }

    async read<T>(key: string): Promise<T> {
        const storedSetting: FabricateSetting<T> = this.load(key);
        if (!storedSetting) {
            throw new Error(`No Setting was found for the key "${key}". `);
        }
        const errors = this.validateSetting(storedSetting);
        if (errors.length !== 0) {
            throw new Error(`Unable to read the setting for the key "${key}". Caused by: ${errors.join(", ")}`);
        }
        const targetVersion = this._targetVersionsByRootSettingKey.get(key);
        if (storedSetting.version === targetVersion) {
            return storedSetting.value;
        }
        return this.migrateSetting(storedSetting,
            targetVersion,
            this._settingsMigrators);
    }

    async write<T>(key: string, value: T): Promise<void> {
        await this.save(key, {
            version: this._targetVersionsByRootSettingKey.get(key),
            value: value
        });
        return;
    }

    private migrateSetting<T>(storedSetting: FabricateSetting<T>,
                              targetVersion: string,
                              settingsMigratorsByInputVersion: Map<string, FabricateSettingMigrator<any, any>>): T {
        let setting: FabricateSetting<any> = storedSetting;
        while (settingsMigratorsByInputVersion.has(setting.version)) {
            const settingMigrator = settingsMigratorsByInputVersion.get(setting.version);
            const value = settingMigrator.perform(setting.value);
            setting = {
                version: settingMigrator.toVersion,
                value
            }
        }
        if (setting.version === targetVersion) {
            return setting.value as T;
        }
        throw new Error(`Could not migrate stored setting value: \n ${storedSetting}. `);
    }

    private validateSetting(setting: FabricateSetting<any>): string[] {
        const errors: string[] = [];
        if (!setting.version) {
            errors.push(`Expected a non-null, non-empty setting version. `);
        }
        if (!setting.value) {
            errors.push(`Expected a non-null, non-empty setting value. `);
        }
        return errors;
    }

    save<T>(key: string, value: T): Promise<T> {
        return this._gameProvider.globalGameObject().settings.set(this._moduleId, key, value);
    }

    load(key: string): any {
        return this._gameProvider.globalGameObject().settings.get(this._moduleId, key);
    }

    async delete<T>(key: string): Promise<T> {
        const setting = this._gameProvider.globalGameObject().settings.storage.get("world").getSetting(`${this._moduleId}.${key}`);
        await setting.delete();
        return setting;
    }

}



export { SettingsManager, DefaultSettingsManager, FabricateSetting, FabricateSettingMigrator }