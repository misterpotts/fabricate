import Properties from "../Properties";
import {GameProvider} from "../foundry/GameProvider";

interface FabricateSetting<T> {
    version: string;
    value: T;
}

interface FabricateSettingMigrator<F, T> {
    fromVersion: string;
    toVersion: string;
    perform: (from: F) => T;
}

interface SettingManager<T> {

    read(): Promise<T>;

    write(value: T): Promise<void>;

    delete(): Promise<T>;

    asVersionedSetting(value: T): FabricateSetting<T>;
}

class DefaultSettingManager<T> implements SettingManager<T> {

    private readonly _moduleId: string;
    private readonly _settingKey: string;
    private readonly _targetVersion: string;
    private readonly _gameProvider: GameProvider;
    private readonly _settingsMigrators: Map<string, FabricateSettingMigrator<any, any>>;

    constructor({
        moduleId = Properties.module.id,
        settingKey,
        targetVersion,
        gameProvider = new GameProvider(),
        settingsMigrators = new Map(),
    }: {
        moduleId?: string;
        settingKey?: string;
        targetVersion: string
        gameProvider?: GameProvider;
        settingsMigrators?: Map<string, FabricateSettingMigrator<any, any>>;
    }) {
        this._moduleId = moduleId;
        this._settingKey = settingKey;
        this._gameProvider = gameProvider;
        this._settingsMigrators = settingsMigrators;
        this._targetVersion = targetVersion;
    }

    public asVersionedSetting(value: T): FabricateSetting<T> {
        return {
            value,
            version: this._targetVersion
        };
    }

    public async read(): Promise<T> {
        const storedSetting: FabricateSetting<T> = this.load(this._settingKey);
        if (!storedSetting) {
            throw new Error(`No Setting was found for the key "${this._settingKey}". `);
        }
        const errors = this.validateSetting(storedSetting);
        if (errors.length !== 0) {
            throw new Error(`Unable to read the setting for the key "${this._settingKey}". Caused by: ${errors.join(", ")} `);
        }
        if (storedSetting.version === this._targetVersion) {
            return storedSetting.value;
        }
        return this.migrateSetting(storedSetting,
            this._targetVersion,
            this._settingsMigrators);
    }

    async write(value: T): Promise<void> {
        await this.save(this._settingKey, {
            version: this._targetVersion,
            value: value
        });
        return;
    }

    private migrateSetting(storedSetting: FabricateSetting<T>,
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

    save(key: string, value: FabricateSetting<T>): Promise<FabricateSetting<T>> {
        return this._gameProvider.globalGameObject().settings.set(this._moduleId, key, value);
    }

    load(key: string): FabricateSetting<T> {
        return this._gameProvider.globalGameObject().settings.get(this._moduleId, key) as FabricateSetting<T>;
    }

    async delete(): Promise<T> {
        const setting = this._gameProvider.globalGameObject().settings.storage.get("world").getSetting(`${this._moduleId}.${this._settingKey}`);
        await setting.delete();
        return setting;
    }

}



export { SettingManager, DefaultSettingManager, FabricateSetting, FabricateSettingMigrator }