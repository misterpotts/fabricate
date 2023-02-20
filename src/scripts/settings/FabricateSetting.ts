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

enum SettingState {
    OUTDATED= "OUTDATED",
    INVALID = "INVALID",
    VALID = "VALID"
}

interface SettingManager<T> {

    read(): T;

    write(value: T): Promise<void>;

    delete(): Promise<T>;

    asVersionedSetting(value: T): FabricateSetting<T>;

    migrate(): Promise<MigrationResult>;

    check(): CheckResult;

}
interface MigrationCheck {
    requiresMigration: boolean;
    currentVersion: string;
    targetVersion: string;
}

interface CheckResult {
    state: SettingState;
    validationCheck: ValidationCheck;
    migrationCheck?: MigrationCheck;
}

interface MigrationResult {
    finalVersion: string;
    initialVersion: string;
    steps: number;
    isSuccessful: boolean;
}

interface ValidationCheck {
    isValid: boolean;
    errors: string[];
}

class DefaultSettingManager<T> implements SettingManager<T> {

    private readonly _moduleId: string;
    private readonly _settingKey: string;
    private readonly _targetVersion: string;
    private readonly _gameProvider: GameProvider;
    private readonly _settingsMigratorsByInputVersion: Map<string, FabricateSettingMigrator<any, any>>;

    constructor({
        moduleId = Properties.module.id,
        settingKey,
        targetVersion,
        gameProvider = new GameProvider(),
        settingsMigrators = [],
    }: {
        moduleId?: string;
        settingKey?: string;
        targetVersion: string
        gameProvider?: GameProvider;
        settingsMigrators?: FabricateSettingMigrator<any, any>[];
    }) {
        this._moduleId = moduleId;
        this._settingKey = settingKey;
        this._gameProvider = gameProvider;
        this._targetVersion = targetVersion;
        this._settingsMigratorsByInputVersion = this.mapSettingsMigrators(settingsMigrators, targetVersion);
    }

    public asVersionedSetting(value: T): FabricateSetting<T> {
        return {
            value,
            version: this._targetVersion
        };
    }

    public read(): T {
        const storedSetting: FabricateSetting<T> = this.load();
        const validationCheck = this.validate(storedSetting);
        if (validationCheck.isValid) {
            return storedSetting.value;
        }
        throw new Error(`Unable to read setting value for key ${this._settingKey}. `);
    }

    async migrate(): Promise<MigrationResult> {
        const initialSetting = this.load();
        console.log(initialSetting); // todo: delete me
        const result: MigrationResult = {
            initialVersion: initialSetting.version,
            finalVersion: null,
            isSuccessful: false,
            steps: 0
        };
        try {
            const migration = this.migrateSettingValue(
                initialSetting,
                this._targetVersion,
                this._settingsMigratorsByInputVersion
            );
            const settingToStore = this.asVersionedSetting(migration.value);
            await this.save(settingToStore);
            result.isSuccessful = true;
            result.steps = migration.steps;
            result.finalVersion = this._targetVersion
            return result;
        } catch (e: any) {
            if (e instanceof Error) {
                console.error(e.stack);
            }
            return result;
        }
    }

    check(): CheckResult {
        const storedSetting: FabricateSetting<T> = this.load();
        const validationCheck = this.validate(storedSetting);
        const result: CheckResult = {
            state: SettingState.VALID,
            migrationCheck: null,
            validationCheck: validationCheck
        };
        if (!validationCheck.isValid) {
            result.state = SettingState.INVALID;
            return result;
        }
        const migrationCheck: MigrationCheck = {
            requiresMigration: false,
            currentVersion: storedSetting.version,
            targetVersion: this._targetVersion
        }
        result.migrationCheck = migrationCheck;
        if (storedSetting.version !== this._targetVersion) {
            migrationCheck.requiresMigration = true;
            result.state = SettingState.OUTDATED;
        }
        return result;
    }

    private validate(setting: FabricateSetting<T>): ValidationCheck  {
        const result: ValidationCheck = {
            isValid: false,
            errors: []
        }
        if (!setting) {
           result.errors.push("notFound");
           return result;
        }
        if (!setting.version) {
            result.errors.push("noVersion");
        }
        if (!setting.value) {
            result.errors.push("noValue");
        }
        if (result.errors.length === 0) {
            result.isValid = true;
        }
        return result;
    }

    async write(value: T): Promise<void> {
        await this.save(this.asVersionedSetting(value));
        return;
    }

    private migrateSettingValue(storedSetting: FabricateSetting<T>,
                              targetVersion: string,
                              settingsMigratorsByInputVersion: Map<string, FabricateSettingMigrator<any, any>>): { steps: number, value: T } {
        let setting: FabricateSetting<any> = storedSetting;
        let steps = 0;
        while (settingsMigratorsByInputVersion.has(setting.version)) {
            const settingMigrator = settingsMigratorsByInputVersion.get(setting.version);
            const value = settingMigrator.perform(setting.value);
            setting = {
                version: settingMigrator.toVersion,
                value
            }
            steps++;
        }
        if (setting.version === targetVersion) {
            return { value: setting.value as T, steps };
        }
        throw new Error(`Could not migrate stored setting value: \n ${storedSetting}. `);
    }

    save(value: FabricateSetting<T>): Promise<FabricateSetting<T>> {
        return this._gameProvider.globalGameObject().settings.set(this._moduleId, this._settingKey, value);
    }

    load(): FabricateSetting<T> {
        return this._gameProvider.globalGameObject().settings.get(this._moduleId, this._settingKey) as FabricateSetting<T>;
    }

    async delete(): Promise<T> {
        const setting = this._gameProvider.globalGameObject().settings.storage.get("world").getSetting(`${this._moduleId}.${this._settingKey}`);
        await setting.delete();
        return setting;
    }

    get settingKey(): string {
        return this._settingKey;
    }

    private mapSettingsMigrators(settingsMigrators: FabricateSettingMigrator<any, any>[], targetVersion: string): Map<string, FabricateSettingMigrator<any, any>> {
        const result = new Map<string, FabricateSettingMigrator<any, any>>();
        if (settingsMigrators.length === 0 ) {
            return result;
        }
        let targetVersionOutputFound = false;
        settingsMigrators.forEach(settingMigrator => {
            if (result.has(settingMigrator.fromVersion)) {
                throw new Error(`Duplicate settings migrators were found for the input version ${settingMigrator.fromVersion}. `);
            }
            result.set(settingMigrator.fromVersion, settingMigrator);
            if (settingMigrator.toVersion === targetVersion) {
                targetVersionOutputFound = true;
            }
        });
        if (!targetVersionOutputFound) {
            throw new Error(`Target version ${targetVersion} is not reachable through the configured settings migrators.`);
        }
        return result;
    }
}

export {
    SettingManager,
    DefaultSettingManager,
    FabricateSetting,
    FabricateSettingMigrator,
    CheckResult,
    SettingState,
    MigrationCheck,
    ValidationCheck
}