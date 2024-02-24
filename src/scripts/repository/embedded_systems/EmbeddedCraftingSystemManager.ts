import {EmbeddedCraftingSystemDefinition} from "./EmbeddedCraftingSystemDefinition";
import {AlchemistsSuppliesV16SystemDefinition} from "./AlchemistsSuppliesV16SystemDefinition";
import {EntityDataStore} from "../EntityDataStore";
import {Recipe, RecipeJson} from "../../crafting/recipe/Recipe";
import {Component, ComponentJson} from "../../crafting/component/Component";
import {Essence, EssenceJson} from "../../crafting/essence/Essence";
import {CraftingSystemJson, CraftingSystem} from "../../crafting/system/CraftingSystem";
import Properties from "../../Properties";

interface EmbeddedCraftingSystemManager {

    restoreForGameSystem(gameSystemId: string, skipInstalled: boolean): Promise<void>;

}

export { EmbeddedCraftingSystemManager };

class DefaultEmbeddedCraftingSystemManager implements EmbeddedCraftingSystemManager {

    private static readonly DEFAULT_EMBEDDED_CRAFTING_SYSTEMS: EmbeddedCraftingSystemDefinition[] = [
        new AlchemistsSuppliesV16SystemDefinition()
    ]

    private readonly _recipeStore: EntityDataStore<RecipeJson, Recipe>;
    private readonly _essenceStore: EntityDataStore<EssenceJson, Essence>;
    private readonly _componentStore: EntityDataStore<ComponentJson, Component>;
    private readonly _craftingSystemStore: EntityDataStore<CraftingSystemJson, CraftingSystem>;
    private readonly _embeddedCraftingSystems: EmbeddedCraftingSystemDefinition[];

    constructor({
        recipeStore,
        essenceStore,
        componentStore,
        craftingSystemStore,
        embeddedCraftingSystems = DefaultEmbeddedCraftingSystemManager.DEFAULT_EMBEDDED_CRAFTING_SYSTEMS,
    }: {
        recipeStore: EntityDataStore<RecipeJson, Recipe>;
        essenceStore: EntityDataStore<EssenceJson, Essence>;
        componentStore: EntityDataStore<ComponentJson, Component>;
        craftingSystemStore: EntityDataStore<CraftingSystemJson, CraftingSystem>;
        embeddedCraftingSystems?: EmbeddedCraftingSystemDefinition[];
    }) {
        this._recipeStore = recipeStore;
        this._essenceStore = essenceStore;
        this._componentStore = componentStore;
        this._craftingSystemStore = craftingSystemStore;
        this._embeddedCraftingSystems = embeddedCraftingSystems;
    }

    async restoreForGameSystem(gameSystemId: string, skipInstalled: boolean): Promise<void> {
        const embeddedCraftingSystemsForGameSystem = this._embeddedCraftingSystems
            .filter(embeddedSystemDefinition => embeddedSystemDefinition.supportedGameSystem === gameSystemId);
        if (skipInstalled) {
            await Promise.all(embeddedCraftingSystemsForGameSystem.map(embeddedSystemDefinition => this._restoreEmbeddedCraftingSystemIfNotInstalled(embeddedSystemDefinition)));
            return;
        }
        await Promise.all(embeddedCraftingSystemsForGameSystem.map(embeddedSystemDefinition => this._restoreEmbeddedCraftingSystem(embeddedSystemDefinition)));
    }

    private async _restoreEmbeddedCraftingSystem(embeddedSystemDefinition: EmbeddedCraftingSystemDefinition): Promise<void> {
        await this._restoreCraftingSystem(embeddedSystemDefinition.craftingSystem);

        await this.deleteEssencesForCraftingSystem(embeddedSystemDefinition.craftingSystem.id);
        await this._restoreEssences(embeddedSystemDefinition.essences);

        await this.deleteComponentsForCraftingSystem(embeddedSystemDefinition.craftingSystem.id);
        await this._restoreComponents(embeddedSystemDefinition.components);

        await this.deleteRecipesForCraftingSystem(embeddedSystemDefinition.craftingSystem.id);
        await this._restoreRecipes(embeddedSystemDefinition.recipes);
    }

    private async _restoreEmbeddedCraftingSystemIfNotInstalled(embeddedSystemDefinition: EmbeddedCraftingSystemDefinition): Promise<void> {
        const isInstalled = await this._craftingSystemStore.has(embeddedSystemDefinition.craftingSystem.id);
        if (isInstalled) {
            return;
        }
        return this._restoreEmbeddedCraftingSystem(embeddedSystemDefinition);
    }

    private async _restoreCraftingSystem(craftingSystem: CraftingSystem): Promise<void> {
        const systemInstalled = await this._craftingSystemStore.has(craftingSystem.id);
        if (systemInstalled) {
            const installedSystem = await this._craftingSystemStore.getById(craftingSystem.id);
            craftingSystem.isDisabled = installedSystem.isDisabled;
        }
        await this._craftingSystemStore.insert(craftingSystem);
    }

    private async _restoreEssences(essences: Essence[]): Promise<void> {
        await this._essenceStore.insertAll(essences);
    }

    private async _restoreComponents(components: Component[]): Promise<void> {
        await this._componentStore.insertAll(components);
    }

    private async _restoreRecipes(recipes: Recipe[]): Promise<void> {
        await this._recipeStore.insertAll(recipes);
    }

    private async deleteEssencesForCraftingSystem(craftingSystemId: string) {
        await this._essenceStore.deleteCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
    }

    private async deleteComponentsForCraftingSystem(craftingSystemId: string) {
        await this._componentStore.deleteCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
    }

    private async deleteRecipesForCraftingSystem(craftingSystemId: string) {
        await this._recipeStore.deleteCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
    }

}

export { DefaultEmbeddedCraftingSystemManager };