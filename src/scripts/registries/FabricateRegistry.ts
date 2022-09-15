import {CraftingSystem} from "../system/CraftingSystem";
import {CraftingSystemDefinition} from "../system_definitions/CraftingSystemDefinition";

import {SYSTEM_DEFINITION as ALCHEMISTS_SUPPLIES} from "../system_definitions/AlchemistsSuppliesV16";
import {GameProvider} from "../foundry/GameProvider";
import Properties from "../Properties";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {RollProvider5EFactory} from "../5e/RollProvider5E";
import {DiceRoller} from "../foundry/DiceRoller";

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
        const craftingSystemSettings = this._GAME.settings.storage.get("world").getSetting(`${Properties.module.id}.${Properties.settings.craftingSystems.key}`);
        const bundledSystemSpecifications = this.bundledSystemSpecifications();
        Object.keys(bundledSystemSpecifications)
            .forEach(id => craftingSystemSettings[id] = bundledSystemSpecifications[id]);
        await this._GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, craftingSystemSettings);
    }

    public async resetAllSystems() {
        const setting = this._GAME.settings.storage.get("world").getSetting(`${Properties.module.id}.${Properties.settings.craftingSystems.key}`);
        await setting.delete();
        await this._GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, this.bundledSystemSpecifications());
    }

    public async saveCraftingSystem(craftingSystem: CraftingSystem): Promise<Record<string, CraftingSystemDefinition>> {
        return this.defineCraftingSystem(craftingSystem.toDefinition());
    }

    public getCraftingSystemById(id: string): CraftingSystem {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as Record<string, CraftingSystemDefinition>;
        if (craftingSystemDefinitions[id]) {
            return this._craftingSystemFactory.make(craftingSystemDefinitions[id])
        }
    }

    public getAllCraftingSystemsById(): Map<string, CraftingSystem> {
        return new Map(this.getAllCraftingSystems()
            .map(craftingSystem => [craftingSystem.id, craftingSystem]));
    }

    public getAllCraftingSystems(): CraftingSystem[] {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as Record<string, CraftingSystemDefinition>;
        return Object.values(craftingSystemDefinitions)
            .map(systemDefinition => this._craftingSystemFactory.make(systemDefinition));
    }

    public async defineCraftingSystem(craftingSystemDefinition: CraftingSystemDefinition): Promise<Record<string, CraftingSystemDefinition>> {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as Record<string, CraftingSystemDefinition>;
        craftingSystemDefinitions[craftingSystemDefinition.id]  = craftingSystemDefinition;
        await this._GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, craftingSystemDefinitions);
        return craftingSystemDefinitions;
    }

    public bundledSystemSpecifications(): Record<string, CraftingSystemDefinition> {
        const systemSpecifications: Record<string, CraftingSystemDefinition> = {};
        systemSpecifications[ALCHEMISTS_SUPPLIES.id] = ALCHEMISTS_SUPPLIES;
        return systemSpecifications;
    }

    async deleteSystem(systemId: string) {
        const craftingSystemDefinitions = this._GAME.settings.get(Properties.module.id, Properties.settings.craftingSystems.key) as Record<string, CraftingSystemDefinition>;
        delete craftingSystemDefinitions[systemId];
        await this._GAME.settings.set(Properties.module.id, Properties.settings.craftingSystems.key, craftingSystemDefinitions);
        return craftingSystemDefinitions;
    }

    async cloneSystem(systemId: string) {
        const sourceCraftingSystem = this.getCraftingSystemById(systemId);
        const clonedDefinition = sourceCraftingSystem.toDefinition();
        clonedDefinition.id = randomID();
        clonedDefinition.details.name = `${sourceCraftingSystem.name} (copy)`
        clonedDefinition.locked = false;
        return this.defineCraftingSystem(clonedDefinition);
    }
}

export { FabricateRegistry }