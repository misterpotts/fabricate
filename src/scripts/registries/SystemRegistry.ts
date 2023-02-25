import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {FabricateSetting, SettingManager} from "../settings/FabricateSetting";
import {ALCHEMISTS_SUPPLIES_SYSTEM_DATA as ALCHEMISTS_SUPPLIES} from "../system/bundled/AlchemistsSuppliesV16";

interface SystemRegistry {

    getCraftingSystemById(id: string): Promise<CraftingSystem>;

    getAllCraftingSystems(): Promise<Map<string, CraftingSystem>>;

    getUserDefinedSystems(): Promise<Map<string, CraftingSystem>>;

    getEmbeddedSystems(): Promise<Map<string, CraftingSystem>>;

    deleteCraftingSystemById(id: string): Promise<void>;

    saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem>;

    saveCraftingSystems(craftingSystems: Map<string, CraftingSystem>): Promise<Map<string, CraftingSystem>>;

    cloneCraftingSystemById(id: string): Promise<CraftingSystem>;

    getEmbeddedCraftingSystemsJson(): CraftingSystemJson[];

    reset(): Promise<void>;

    getDefaultSettingValue(): FabricateSetting<Record<string, CraftingSystemJson>>;

    createCraftingSystem(systemDefinition: CraftingSystemJson): Promise<CraftingSystem>;

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

    /**
     * Removes bundled systems from stored settings.
     *
     * todo: deprecate and delete in later versions
     * */
    public async purgeBundledSystemsFromStoredSettings(): Promise<void> {
        return this.deleteCraftingSystemById(ALCHEMISTS_SUPPLIES.definition.id);
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
        const craftingSystemJson = allCraftingSystemSettings[id];
        return this._craftingSystemFactory.make(craftingSystemJson);
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
        const craftingSystem = await this._craftingSystemFactory.make(systemDefinition);
        return this.saveCraftingSystem(craftingSystem);
    }

}

export { SystemRegistry, DefaultSystemRegistry, ErrorDecisionType }