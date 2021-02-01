import {Fabricator} from "./Fabricator";
import {Recipe} from "./Recipe";
import {CraftingComponent} from "./CraftingComponent";
import {FabricateFlags, FabricateItemType} from "./FabricateFlags";
import {CraftingResult} from "./CraftingResult";
import {InventoryRecord} from "./InventoryRecord";
import {ActionType} from "./ActionType";

class CraftingSystem {
    private readonly _name: string;
    private readonly _compendiumPackKey: string;
    private readonly _fabricator: Fabricator;
    private readonly _fabricatorSupplier: () => Fabricator;
    private readonly _recipes: Recipe[];
    private readonly _components: CraftingComponent[];
    private readonly _supportedGameSystems: string[];

    constructor(builder: CraftingSystem.Builder) {
        this._name = builder.name;
        this._compendiumPackKey = builder.compendiumPackKey;
        this._fabricator = builder.fabricator;
        this._fabricatorSupplier = builder.fabricatorSupplier;
        this._recipes = builder.recipes;
        this._components = builder.components;
        this._supportedGameSystems = builder.supportedGameSystems;
    }

    public static builder() {
        return new CraftingSystem.Builder();
    }

    public getFirstRecipeByName(name: string): Recipe {
        return <Recipe>this._recipes.find((recipe) => {
            return recipe.name === name
        });
    }

    get name(): string {
        return this._name;
    }

    public async craft(actorId: string, recipeId: string) {
        const actor: Actor = game.actors.get(actorId);
        const recipe: Recipe = this._recipes.find((recipe: Recipe) => recipe.itemId == recipeId);
        const inventory: Map<string, InventoryRecord[]> = this.scanInventory(actor);
        const craftingComponents: CraftingComponent[] = Array.from(inventory.values()).deepFlatten()
            .map((inventoryRecord: InventoryRecord) => inventoryRecord.componentType);
        const fabricatorInstance = this.fabricator;
        fabricatorInstance.prepare(recipe, craftingComponents);
        if (!fabricatorInstance.ready()) {
            throw new Error(`Unable to fabricate ${recipe.name}. `);
        }
        const craftingResults: CraftingResult[] = fabricatorInstance.fabricate();
        craftingResults.forEach((craftingResult: CraftingResult) => {
            this.applyCraftingResultToInventory(actor, inventory, craftingResult);
        });
    }

    private async applyCraftingResultToInventory(actor: Actor, inventory: Map<string, InventoryRecord[]>, craftingResult: CraftingResult) {
        const compendium: Compendium = game.packs.get(this.compendiumPackKey);
        if (craftingResult.action === ActionType.ADD) {
            const itemData: Entity = await compendium.getEntity(craftingResult.item.compendiumEntry.entryId);
            await actor.createOwnedItem(itemData);
        } else if (craftingResult.action === ActionType.REMOVE) {
            const removalCandidates: InventoryRecord[] = inventory.get(craftingResult.item.compendiumEntry.entryId);
            if (!removalCandidates || removalCandidates.length < craftingResult.quantity) {
                throw new Error(`Oops! Actor ${actor.id} does not own enough ${craftingResult.item.name}. `);
            }
            let remaining: number = craftingResult.quantity;
            let position = 0;
            while (remaining > 0) {
                await actor.deleteOwnedItem(removalCandidates[position].item.id);
                position++;
                remaining--;
            }
        }
    }

    private scanInventory(actor: Actor): Map<string, InventoryRecord[]> {
        const inventoryRecords: InventoryRecord[] = actor.items.filter(this.isFabricateComponent())
            .map((item: any) => { // Expects an Item5E, need type def
                return InventoryRecord.builder()
                    .withItem(item)
                    .withActor(actor)
                    .withQuantity(item.data.data.quantity ? item.data.data.quantity : 1)
                    .withCraftingComponent(CraftingComponent.fromFlags(item.data.flags.fabricate))
                    .build()
            });
        let result: Map<string, InventoryRecord[]> = new Map();
        inventoryRecords.forEach((record: InventoryRecord) => {
            const compendiumItemId = record.componentType.compendiumEntry.entryId;
            let recordsForItem = result.get(compendiumItemId);
            if (!recordsForItem) {
                result.set(compendiumItemId, [record])
            } else {
                recordsForItem.push(record);
            }
        });
        return result;
    }

    private isFabricateComponent(): (item: Item) => boolean {
        return (item: Item) => {
            if (!item.data.flags.fabricate) {
                return false;
            }
            const flags: FabricateFlags = item.data.flags.fabricate;
            return flags.type === FabricateItemType.COMPONENT;
        }
    }

    get compendiumPackKey(): string {
        return this._compendiumPackKey;
    }

    get fabricator(): Fabricator {
        return this._fabricatorSupplier ? this._fabricatorSupplier() : this._fabricator;
    }

    get supportedGameSystems(): string[] {
        return this._supportedGameSystems;
    }

    get recipes(): Recipe[] {
        return this._recipes;
    }

    get components(): CraftingComponent[] {
        return this._components;
    }

    public supports(gameSystem: string) {
        if (!this._supportedGameSystems || this._supportedGameSystems.length == 0) {
            return true;
        }
        return this._supportedGameSystems.indexOf(gameSystem) > -1;
    }
}

namespace CraftingSystem {
    export class Builder {
        public name!: string;
        public compendiumPackKey!: string;
        public fabricator!: Fabricator;
        public fabricatorSupplier!: () => Fabricator;
        public supportedGameSystems: string[] = [];
        public recipes: Recipe[] = [];
        public components: CraftingComponent[] = [];

        public withName(value: string) : Builder {
            this.name = value;
            return this;
        }

        public withCompendiumPackKey(value: string) : Builder {
            this.compendiumPackKey = value;
            return this;
        }

        public withFabricator(value: Fabricator) : Builder {
            this.fabricator = value;
            return this;
        }

        public withFabricatorSupplier(value: () => Fabricator) : Builder {
            this.fabricatorSupplier = value;
            return this;
        }

        public withSupportedGameSystems(value: string[]) : Builder {
            this.supportedGameSystems = value;
            return this;
        }

        public withSupportedGameSystem(value: string) : Builder {
            this.supportedGameSystems.push(value);
            return this;
        }

        public withRecipes(value: Recipe[]) : Builder {
            this.recipes = value;
            return this;
        }

        public withRecipe(value: Recipe) : Builder {
            this.recipes.push(value);
            return this;
        }

        public withComponents(value: CraftingComponent[]) : Builder {
            this.components = value;
            return this;
        }

        public withComponent(value: CraftingComponent) : Builder {
            this.components.push(value);
            return this;
        }

        public build() : CraftingSystem {
            return new CraftingSystem(this);
        }
    }
}

export { CraftingSystem };