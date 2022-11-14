import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {FabricateSetting, SettingsManager} from "../interface/settings/FabricateSettings";
import Properties from "../Properties";
import {SYSTEM_DEFINITION as ALCHEMISTS_SUPPLIES} from "../system_definitions/AlchemistsSuppliesV16";

interface SystemRegistry {

    getCraftingSystemById(id: string): Promise<CraftingSystem>;

    getAllCraftingSystems(): Promise<Map<string, CraftingSystem>>;

    deleteCraftingSystemById(id: string): Promise<void>;

    saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem>;

    cloneCraftingSystemById(id: string): Promise<CraftingSystem>;

    getBundledCraftingSystemsJson(): Record<string, CraftingSystemJson>;

    reset(): Promise<void>;

    getDefaultSettingValue(): FabricateSetting<Record<string, CraftingSystemJson>>;

    createCraftingSystem(systemDefinition: CraftingSystemJson): Promise<CraftingSystem>;

}

class DefaultSystemRegistry implements SystemRegistry {

    private readonly _settingsManager: SettingsManager;
    private readonly _craftingSystemFactory: CraftingSystemFactory;

    constructor({
        settingsManager,
        craftingSystemFactory
    }: {
        settingsManager: SettingsManager,
        craftingSystemFactory: CraftingSystemFactory
    }) {
        this._settingsManager = settingsManager;
        this._craftingSystemFactory = craftingSystemFactory;
    }

    async deleteCraftingSystemById(id: string): Promise<void> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read(Properties.settings.craftingSystems.key);
        delete allCraftingSystemSettings[id];
        await this._settingsManager.write(Properties.settings.craftingSystems.key, allCraftingSystemSettings);
    }

    async getAllCraftingSystems(): Promise<Map<string, CraftingSystem>> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read(Properties.settings.craftingSystems.key);
        const craftingSystems = await Promise.all(Object.values(allCraftingSystemSettings)
            .map(craftingSystemJson => this._craftingSystemFactory.make(craftingSystemJson)));
        return new Map(craftingSystems.map(craftingSystem => [craftingSystem.id.value, craftingSystem]));
    }

    async getCraftingSystemById(id: string): Promise<CraftingSystem> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read(Properties.settings.craftingSystems.key);
        const craftingSystemJson = allCraftingSystemSettings[id];
        return this._craftingSystemFactory.make(craftingSystemJson);
    }

    async cloneCraftingSystemById(id: string): Promise<CraftingSystem> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read(Properties.settings.craftingSystems.key);
        const sourceCraftingSystem = allCraftingSystemSettings[id];
        const clonedSystemJson = deepClone(sourceCraftingSystem);
        clonedSystemJson.id = randomID();
        clonedSystemJson.details.name = `${sourceCraftingSystem.details.name} (copy)`
        clonedSystemJson.locked = false;
        allCraftingSystemSettings[clonedSystemJson.id] = clonedSystemJson;
        await this._settingsManager.write(Properties.settings.craftingSystems.key, allCraftingSystemSettings);
        return this._craftingSystemFactory.make(clonedSystemJson);
    }

    async saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        const craftingSystemJson = craftingSystem.toJson();
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read(Properties.settings.craftingSystems.key);
        allCraftingSystemSettings[craftingSystem.id.value] = craftingSystemJson;
        await this._settingsManager.write(Properties.settings.craftingSystems.key, allCraftingSystemSettings);
        return craftingSystem;
    }

    getBundledCraftingSystemsJson(): Record<string, CraftingSystemJson> {
        const systemSpecifications: Record<string, CraftingSystemJson> = {};
        systemSpecifications[ALCHEMISTS_SUPPLIES.id] = ALCHEMISTS_SUPPLIES;
        return systemSpecifications;
    }

    async reset(): Promise<void> {
        await this._settingsManager.delete(Properties.settings.craftingSystems.key);
        await this._settingsManager.write(Properties.settings.craftingSystems.key, this.getBundledCraftingSystemsJson());
    }

    getDefaultSettingValue(): FabricateSetting<Record<string, CraftingSystemJson>> {
        return this._settingsManager.asVersionedSetting(this.getBundledCraftingSystemsJson(), Properties.settings.craftingSystems.key);
    }

    async createCraftingSystem(systemDefinition: CraftingSystemJson): Promise<CraftingSystem> {
        const craftingSystem = await this._craftingSystemFactory.make(systemDefinition);
        return this.saveCraftingSystem(craftingSystem);
    }
}

export { SystemRegistry, DefaultSystemRegistry }