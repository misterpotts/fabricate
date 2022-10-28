import {CraftingSystem} from "../system/CraftingSystem";
import {CraftingSystemSettingsValueV1} from "../interface/settings/values/CraftingSystemSettingsValueV1";

import {SYSTEM_DEFINITION as ALCHEMISTS_SUPPLIES} from "../system_definitions/AlchemistsSuppliesV16";
import {GameProvider} from "../foundry/GameProvider";
import Properties from "../Properties";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {RollProvider5EFactory} from "../5e/RollProvider5E";
import {DiceRoller} from "../foundry/DiceRoller";
import {CraftingSystemSettingsValueV2} from "../interface/settings/values/CraftingSystemSettingsValueV2";

class FabricateRegistry {

    private readonly _GAME: Game;
    private readonly _craftingSystemFactory: CraftingSystemFactory;

    constructor(gameProvider: GameProvider) {
        this._GAME = gameProvider.globalGameObject();
        this._craftingSystemFactory = new CraftingSystemFactory({
            rollProviderFactory: new RollProvider5EFactory(),
            diceRoller: new DiceRoller("1d20")
        }); // todo fix these typed values
    }

    public async resetAllBundledSystems() {
        const craftingSystemSettings = this._GAME.settings.storage.get("world").getSetting(`${Properties.module.id}.${Properties.settings.keys.craftingSystems}`);
        const bundledSystemSpecifications = this.bundledSystemSpecifications();
        Object.keys(bundledSystemSpecifications)
            .forEach(id => craftingSystemSettings[id] = bundledSystemSpecifications[id]);
        await this._GAME.settings.set(Properties.module.id, Properties.settings.keys.craftingSystems, craftingSystemSettings);
    }

    public async resetAllSystems() {
        const setting = this._GAME.settings.storage.get("world").getSetting(`${Properties.module.id}.${Properties.settings.keys.craftingSystems}`);
        await setting.delete();
        await this._GAME.settings.set(Properties.module.id, Properties.settings.keys.craftingSystems, this.bundledSystemSpecifications());
    }

    saveCraftingSystem(craftingSystem: CraftingSystem): Promise<Record<string, CraftingSystemSettingsValueV2>> {
        return this.defineCraftingSystem(craftingSystem.toDefinition());
    }

    public async getCraftingSystemById(id: string): Promise<CraftingSystem> {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.keys.craftingSystems) as Record<string, CraftingSystemSettingsValueV2>;
        if (craftingSystemDefinitions[id]) {
            return await this._craftingSystemFactory.make(craftingSystemDefinitions[id])
        }
    }

    public async getAllCraftingSystemsById(): Promise<Map<string, CraftingSystem>> {
        const craftingSystems = await this.getAllCraftingSystems();
        return new Map(craftingSystems
            .map(craftingSystem => [craftingSystem.id, craftingSystem]));
    }

    public async getAllCraftingSystems(): Promise<CraftingSystem[]> {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.keys.craftingSystems) as Record<string, CraftingSystemSettingsValueV2>;
        return Promise.all(Object.values(craftingSystemDefinitions)
            .map(systemDefinition => this._craftingSystemFactory.make(systemDefinition)));
    }

    public async defineCraftingSystem(craftingSystemDefinition: CraftingSystemSettingsValueV2): Promise<Record<string, CraftingSystemSettingsValueV2>> {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.keys.craftingSystems) as Record<string, CraftingSystemSettingsValueV2>;
        craftingSystemDefinitions[craftingSystemDefinition.id]  = craftingSystemDefinition;
        await this._GAME.settings.set(Properties.module.id, Properties.settings.keys.craftingSystems, craftingSystemDefinitions);
        return craftingSystemDefinitions;
    }

    public bundledSystemSpecifications(): Record<string, CraftingSystemSettingsValueV2> {
        const systemSpecifications: Record<string, CraftingSystemSettingsValueV2> = {};
        systemSpecifications[ALCHEMISTS_SUPPLIES.id] = ALCHEMISTS_SUPPLIES;
        return systemSpecifications;
    }

    async deleteSystem(systemId: string) {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.keys.craftingSystems) as Record<string, CraftingSystemSettingsValueV1>;
        delete craftingSystemDefinitions[systemId];
        await this._GAME.settings.set(Properties.module.id, Properties.settings.keys.craftingSystems, craftingSystemDefinitions);
        return craftingSystemDefinitions;
    }

    async cloneSystem(systemId: string) {
        const sourceCraftingSystem = await this.getCraftingSystemById(systemId);
        const clonedDefinition = sourceCraftingSystem.toDefinition();
        clonedDefinition.id = randomID();
        clonedDefinition.details.name = `${sourceCraftingSystem.name} (copy)`
        clonedDefinition.locked = false;
        return this.defineCraftingSystem(clonedDefinition);
    }
}

export { FabricateRegistry }