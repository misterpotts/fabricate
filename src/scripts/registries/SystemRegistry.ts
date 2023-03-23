import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {FabricateSetting, SettingManager} from "../settings/FabricateSetting";
import {ALCHEMISTS_SUPPLIES_SYSTEM_DATA as ALCHEMISTS_SUPPLIES} from "../system/bundled/AlchemistsSuppliesV16";

interface SystemRegistry {

    /**
     * Gets a crafting system by ID.
     *
     * @param id The ID of the Crafting system to get
     * @return A Promise that resolves to the crafting system with the provided ID, or undefined
    * */
    getCraftingSystemById(id: string): Promise<CraftingSystem>;

    /**
     * Gets all crafting systems, including both embedded and user-defined systems.
     *
     * @return A Promise that resolves to a Map of crafting systems, keyed on the crafting system ID
     * */
    getAllCraftingSystems(): Promise<Map<string, CraftingSystem>>;

    /**
     * Gets all crafting systems that were defined by users. Does not include embedded systems.
     *
     * @return A Promise that resolves to a Map of crafting systems, keyed on the crafting system ID
     * */
    getUserDefinedSystems(): Promise<Map<string, CraftingSystem>>;

    /**
     * Gets all crafting systems that were embedded with Fabricate for the current game system only. Does not include
     * user-defined systems.
     *
     * @return A Promise that resolves to a Map of crafting systems, keyed on the crafting system ID
     * */
    getEmbeddedSystems(): Promise<Map<string, CraftingSystem>>;

    /**
     * Delete a crafting system by ID. This will remove the crafting system, its recipes, components and essences. This
     * operation is permanent and cannot be undone
     *
     * @param id The ID of the Crafting system to delete
     * @return A Promise that resolves when the crafting system has been deleted, or if the crafting system ID is not
     *  found
     * */
    deleteCraftingSystemById(id: string): Promise<void>;

    /**
     * Saves a crafting system, updating the existing data for that system and modifying all essences, recipes and
     * components within the crafting system. Any deleted essences, components and recipes are removed from the saved
     * data.
     *
     * @param craftingSystem The crafting system to save
     * @return A Promise that resolves when the crafting system has been saved
     * */
    saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem>;

    /**
     * Saves multiple crafting systems, updating the existing data for each system and modifying all essences, recipes
     * and components within each crafting system. Any deleted essences, components and recipes are removed from the
     * saved crafting system data.
     *
     * @param craftingSystems A map of crafting systems to save, keyed on the crafting system ID
     * @return A Promise that resolves when the crafting systems have been saved
     * */
    saveCraftingSystems(craftingSystems: Map<string, CraftingSystem>): Promise<Map<string, CraftingSystem>>;

    /**
     * Creates a copy of a crafting system, including all essences, recipes and components within the source crafting
     * system. The cloned system is created with a modified name and a new, unique ID.
     *
     * @param id The ID of the crafting system to duplicate
     * @return A Promise that resolves when the crafting system has been duplicated and saved
     * */
    cloneCraftingSystemById(id: string): Promise<CraftingSystem>;

    /**
     * Gets the serialised representation of all crafting systems embedded with Fabricate for the current game system
     * only.
     *
     * @return an array of serialised crafting system data for the embedded crafting systems that support the current
     *  game system
     * */
    getEmbeddedCraftingSystemsJson(): CraftingSystemJson[];

    /**
     * Performs a complete reset of all Fabricate data, restoring the state of the module data at the time of
     * installation. All user-defined crafting systems will be deleted during this reset.
     *
     * @return A Promise that resolves when all Fabricate data has been reset
     * */
    reset(): Promise<void>;

    /**
     * Gets the default value for Fabricate's crafting system settings. This will include embedded crafting systems for
     * the current game system, but no user-defined crafting systems present.
     *
     * @return the default setting value for Fabricate
     * */
    getDefaultSettingValue(): FabricateSetting<Record<string, CraftingSystemJson>>;

    /**
     * Creates a crafting system from a serialised `CraftingSystemJson` definition.
     *
     * @param systemDefinition the serialised crafting system definition
     * @return a promise that resolves to the newly created crafting system
     * */
    createCraftingSystem(systemDefinition: CraftingSystemJson): Promise<CraftingSystem>;

    /**
     * Checks if a crafting system with a given ID exists.
     *
     * @param id The ID of the Crafting system to check
     * @return A Promise that resolves to a boolean value that is true if a crafting system with the given ID exists,
     *  false if not
     * */
    hasCraftingSystem(id: string): Promise<boolean>;

}

enum ErrorDecisionType {
    DELETE,
    RETAIN,
    RESET
}

class DefaultSystemRegistry implements SystemRegistry {

    private readonly _gameSystem: string;
    private readonly _settingsManager: SettingManager<Record<string, CraftingSystemJson>>;
    private readonly _craftingSystemFactory: CraftingSystemFactory;

    constructor({
        settingManager,
        craftingSystemFactory,
        gameSystem
    }: {
        settingManager: SettingManager<Record<string, CraftingSystemJson>>;
        craftingSystemFactory: CraftingSystemFactory;
        gameSystem: string;
    }) {
        this._settingsManager = settingManager;
        this._craftingSystemFactory = craftingSystemFactory;
        this._gameSystem = gameSystem;
    }

    async deleteCraftingSystemById(id: string): Promise<void> {
        const allCraftingSystemSettings = await this._settingsManager.read();
        delete allCraftingSystemSettings[id];
        await this._settingsManager.write(allCraftingSystemSettings);
    }

    public async getAllCraftingSystems(): Promise<Map<string, CraftingSystem>> {
        const allCraftingSystems = await Promise.all([
            this.getUserDefinedSystems(),
            this.getEmbeddedSystems()
        ]);
        return new Map(allCraftingSystems
            .flatMap(systemsById => <CraftingSystem[]>Array.from(systemsById.values()))
            .map(value => <[string, CraftingSystem][]>[[value.id, value]])
            .reduce((left, right) => left.concat(right), []));
    }

    async getEmbeddedSystems(): Promise<Map<string, CraftingSystem>> {
        const embeddedSystems = await Promise.all(this.getEmbeddedCraftingSystemsJson()
            .map(craftingSystemJson => this._craftingSystemFactory.make(craftingSystemJson)));
        return new Map(embeddedSystems.map(embeddedSystem => [embeddedSystem.id, embeddedSystem]));
    }

    async getUserDefinedSystems(): Promise<Map<string, CraftingSystem>> {
        let userDefinedCraftingSystemsJson: Record<string, CraftingSystemJson> = {};
        userDefinedCraftingSystemsJson = await this._settingsManager.read();
        return this.prepareCraftingSystemsData(userDefinedCraftingSystemsJson);
    }

    private async prepareCraftingSystemsData(userDefinedCraftingSystemsJson: Record<string, CraftingSystemJson>): Promise<Map<string, CraftingSystem>> {
        const userDefinedSystems = await Promise.all(Object.values(userDefinedCraftingSystemsJson)
            .map(craftingSystemJson => this._craftingSystemFactory.make(craftingSystemJson)));
        return new Map(userDefinedSystems.map(userDefinedSystem => [userDefinedSystem.id, userDefinedSystem]));
    }

    async getCraftingSystemById(id: string): Promise<CraftingSystem> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read();
        if (id in allCraftingSystemSettings) {
            const craftingSystemJson = allCraftingSystemSettings[id];
            return this._craftingSystemFactory.make(craftingSystemJson);
        }
        return undefined;
    }

    async hasCraftingSystem(id: string): Promise<boolean> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read();
        return allCraftingSystemSettings[id] !== undefined;
    }

    async cloneCraftingSystemById(id: string): Promise<CraftingSystem> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read();
        const sourceCraftingSystem = allCraftingSystemSettings[id];
        const clonedSystemJson = deepClone(sourceCraftingSystem);
        clonedSystemJson.id = randomID();
        clonedSystemJson.details.name = `${sourceCraftingSystem.details.name} (copy)`
        clonedSystemJson.locked = false;
        allCraftingSystemSettings[clonedSystemJson.id] = clonedSystemJson;
        await this._settingsManager.write(allCraftingSystemSettings);
        return this._craftingSystemFactory.make(clonedSystemJson);
    }

    public async saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        const craftingSystemJson = craftingSystem.toJson();
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read();
        allCraftingSystemSettings[craftingSystem.id] = craftingSystemJson;
        await this._settingsManager.write(allCraftingSystemSettings);
        return craftingSystem;
    }

    async saveCraftingSystems(craftingSystemsToSave: Map<string, CraftingSystem>): Promise<Map<string, CraftingSystem>> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = {};
        craftingSystemsToSave
            .forEach((value, key) => allCraftingSystemSettings[key] = value.toJson());
        await this._settingsManager.write(allCraftingSystemSettings);
        return this.prepareCraftingSystemsData(allCraftingSystemSettings);
    }

    public getEmbeddedCraftingSystemsJson(): CraftingSystemJson[] {
        const bundledSystems = [ALCHEMISTS_SUPPLIES];
        return bundledSystems.filter(bundledSystem => !bundledSystem.gameSystem || bundledSystem.gameSystem === this._gameSystem)
            .map(bundledSystem => bundledSystem.definition);
    }

    public async reset(): Promise<void> {
        await this._settingsManager.delete();
    }

    public getDefaultSettingValue(): FabricateSetting<Record<string, CraftingSystemJson>> {
        return this._settingsManager.asVersionedSetting({});
    }

    public async createCraftingSystem(systemDefinition: CraftingSystemJson): Promise<CraftingSystem> {
        if (!systemDefinition.id) {
            systemDefinition.id = randomID();
        }
        if (!systemDefinition.parts) {
            systemDefinition.parts = {
                components: {},
                recipes: {},
                essences: {}
            }
        }
        if (!systemDefinition.parts.components) { systemDefinition.parts.components = {}; }
        if (!systemDefinition.parts.recipes) { systemDefinition.parts.recipes = {}; }
        if (!systemDefinition.parts.essences) { systemDefinition.parts.essences = {}; }

        const craftingSystem = await this._craftingSystemFactory.make(systemDefinition);
        await craftingSystem.loadPartDictionary();
        return this.saveCraftingSystem(craftingSystem);
    }

}

export { SystemRegistry, DefaultSystemRegistry, ErrorDecisionType }