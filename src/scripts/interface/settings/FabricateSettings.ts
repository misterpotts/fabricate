import Properties from "../../Properties";
import {GameProvider} from "../../foundry/GameProvider";
import {CraftingSystemSettingsValueV2} from "./values/CraftingSystemSettingsValueV2";
import {CraftingSystemSettingsValueV1} from "./values/CraftingSystemSettingsValueV1";

const craftingSystemType = "CraftingSystem";

interface FabricateSetting<V> {
    version: string;
    type: string;
    value: V;
}

interface SettingMigrator<F, T> {
    fromVersion: string;
    toVersion: string;
    perform: (from: FabricateSetting<F>) => FabricateSetting<T>;
}

class CraftingSystemSettingV1Migrator implements SettingMigrator<CraftingSystemSettingsValueV1, CraftingSystemSettingsValueV2> {

    get fromVersion(): string {
        return "1"
    };

    get toVersion(): string {
        return "2"
    };

    perform(from: FabricateSetting<CraftingSystemSettingsValueV1>): FabricateSetting<CraftingSystemSettingsValueV2> {
        const inValue = from.value;
        const outValue: CraftingSystemSettingsValueV2 = {
            id: inValue.id,
            details: {
                name: inValue.name,
                author: inValue.author,
                summary: inValue.summary,
                description: inValue.description
            },
            alchemy: inValue.alchemy,
            checks: inValue.checks,
            essences: inValue.essences,
            componentIds: inValue.componentIds,
            enabled: inValue.enabled,
            locked: inValue.locked,
            recipeIds: inValue.recipeIds
        };
        return {
            value: outValue,
            version: this.toVersion,
            type: craftingSystemType
        }
    }

}

class FabricateSettingsManager {

    private readonly _moduleId: string;
    private readonly _gameProvider: GameProvider;
    private readonly _settingsMigrators: Map<string, SettingMigrator<any, any>>;

    constructor({
        gameProvider,
        moduleId,
        settingsMigrators
    }: {
        gameProvider?: GameProvider,
        moduleId?: string,
        settingsMigrators?: Map<string, SettingMigrator<any, any>>
    }) {
        this._moduleId = moduleId ?? Properties.module.id;
        this._gameProvider = gameProvider ?? new GameProvider();
        this._settingsMigrators = settingsMigrators ?? FabricateSettingsManager.defaultSettingsMigrators();
    }

    static defaultSettingsMigrators(): Map<string, SettingMigrator<any, any>> {
        const defaultValue = new Map<string, SettingMigrator<any, any>>();
        defaultValue.set("1", new CraftingSystemSettingV1Migrator());
        return defaultValue;
    }

    get moduleId(): string {
        return this._moduleId;
    }

    async loadCraftingSystem(id: string): Promise<CraftingSystemSettingsValueV2> {
        const storedSetting: FabricateSetting<any> = this.load(Properties.settings.keys.craftingSystem(id));
        if (!storedSetting) {
            throw new Error(`No Crafting System Setting was found for the system with ID "${id}". `);
        }
        const errors = this.validateSystemSetting(storedSetting, craftingSystemType);
        if (errors.length !== 0) {
            console.error(`Unable to read the stored Crafting System Setting for the system with ID "${id}". `);
            console.error(`Caused by: ${errors.join(", ")} `);
            await this.deleteCraftingSystemSetting(id);
            throw new Error(`Could not read crafting system settings for system ID "${id}". `);
        }
        return this.migrateCraftingSystemSetting(storedSetting);
    }


    private migrateCraftingSystemSetting(storedSetting: FabricateSetting<any>): CraftingSystemSettingsValueV2 {
        let setting = storedSetting;
        while (this._settingsMigrators.has(setting.version)) {
            setting = this._settingsMigrators.get(setting.version)
                .perform(setting);
        }
        if (setting.version === "2") {
            return setting.value as CraftingSystemSettingsValueV2;
        }
        throw new Error(`Could not migrate stored setting value: \n ${storedSetting}. `);
    }

    private async deleteCraftingSystemSetting(id: string): Promise<void> {
        console.error(`Dumping stored value to console and deleting setting. `);
        const allSystems = this.load(Properties.settings.keys.craftingSystems);
        console.error(allSystems[id]);
        delete allSystems[id];
        await this.save(Properties.settings.keys.craftingSystems, allSystems);
    }

    private validateSystemSetting(setting: FabricateSetting<any>, expectedType: string): string[] {
        const errors: string[] = [];
        if (setting.type !== expectedType) {
            errors.push(`Expected a type of "${expectedType}", but was "${setting.type}". `);
        }
        if (!setting.version) {
            errors.push(`Setting value has no version. `);
        }
        return errors;
    }

    save<T>(key: string, value: T): Promise<T> {
        return this._gameProvider.globalGameObject().settings.set(this._moduleId, key, value);
    }

    load(key: string): any {
        return this._gameProvider.globalGameObject().settings.get(this._moduleId, key);
    }

}



export { FabricateSettingsManager }