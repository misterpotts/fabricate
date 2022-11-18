import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {FabricateSetting, SettingManager} from "../interface/settings/FabricateSettings";
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

enum ErrorDecisionType {
    DELETE,
    RETAIN,
    RESET
}

type ErrorDecisionProvider = (error: Error) => Promise<ErrorDecisionType>;

class DefaultSystemRegistry implements SystemRegistry {

    private readonly _settingsManager: SettingManager<Record<string, CraftingSystemJson>>;
    private readonly _craftingSystemFactory: CraftingSystemFactory;
    private readonly _errorDecisionProvider: ErrorDecisionProvider;

    constructor({
        settingManager,
        craftingSystemFactory,
        errorDecisionProvider
    }: {
        settingManager: SettingManager<Record<string, CraftingSystemJson>>;
        craftingSystemFactory: CraftingSystemFactory;
        errorDecisionProvider: ErrorDecisionProvider;
    }) {
        this._settingsManager = settingManager;
        this._craftingSystemFactory = craftingSystemFactory;
        this._errorDecisionProvider = errorDecisionProvider;
    }

    async deleteCraftingSystemById(id: string): Promise<void> {
        const allCraftingSystemSettings = await this._settingsManager.read();
        delete allCraftingSystemSettings[id];
        await this._settingsManager.write(allCraftingSystemSettings);
    }

    public async getAllCraftingSystems(): Promise<Map<string, CraftingSystem>> {
        let allCraftingSystemSettings: Record<string, CraftingSystemJson> = {};
        try {
            allCraftingSystemSettings = await this._settingsManager.read();
        } catch (e: any) {
            allCraftingSystemSettings = await this.handleReadError(e);
        }
        const craftingSystems = await Promise.all(Object.values(allCraftingSystemSettings)
            .map(craftingSystemJson => this._craftingSystemFactory.make(craftingSystemJson)));
        return new Map(craftingSystems.map(craftingSystem => [craftingSystem.id, craftingSystem]));
    }

    private async handleReadError(e: any): Promise<Record<string, CraftingSystemJson>> {
        const error: Error = e instanceof Error ? e : new Error(`An unexpected error occurred reading crafting systems. `);
        const decision = await this._errorDecisionProvider(error);
        switch (decision) {
            case ErrorDecisionType.RESET:
                await this._settingsManager.delete();
                const bundledCraftingSystemsJson = this.getBundledCraftingSystemsJson();
                await this._settingsManager.write(bundledCraftingSystemsJson);
                return bundledCraftingSystemsJson;
            default:
                return {}
        }
    }

    async getCraftingSystemById(id: string): Promise<CraftingSystem> {
        const allCraftingSystemSettings: Record<string, CraftingSystemJson> = await this._settingsManager.read();
        const craftingSystemJson = allCraftingSystemSettings[id];
        return this._craftingSystemFactory.make(craftingSystemJson);
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

    public getBundledCraftingSystemsJson(): Record<string, CraftingSystemJson> {
        const systemSpecifications: Record<string, CraftingSystemJson> = {};
        systemSpecifications[ALCHEMISTS_SUPPLIES.id] = ALCHEMISTS_SUPPLIES;
        return systemSpecifications;
    }

    public async reset(): Promise<void> {
        await this._settingsManager.delete();
        await this._settingsManager.write(this.getBundledCraftingSystemsJson());
    }

    public getDefaultSettingValue(): FabricateSetting<Record<string, CraftingSystemJson>> {
        return this._settingsManager.asVersionedSetting(this.getBundledCraftingSystemsJson(), );
    }

    public async createCraftingSystem(systemDefinition: CraftingSystemJson): Promise<CraftingSystem> {
        const craftingSystem = await this._craftingSystemFactory.make(systemDefinition);
        return this.saveCraftingSystem(craftingSystem);
    }
}

export { SystemRegistry, DefaultSystemRegistry, ErrorDecisionType }