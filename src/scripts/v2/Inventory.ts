import {CraftingComponent} from "./CraftingComponent";
import {EssenceDefinition} from "./EssenceDefinition";
import {Combination, Unit} from "./Combination";
import {FabricationAction} from "./FabricationAction";

interface Inventory<I extends Item, A extends Actor<Actor.Data, I>> {
    actor: A;
    ownedComponents: Combination<CraftingComponent>;
    containsIngredients(ingredients: Combination<CraftingComponent>): boolean;
    containsEssences(essences: Combination<EssenceDefinition>): boolean;
    selectFor(essences: Combination<EssenceDefinition>): Combination<CraftingComponent>;
    excluding(ingredients: Combination<CraftingComponent>): Inventory<I, A>;
    removeAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]>;
    addAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]>;
}

interface InventorySearch {
    perform(contents: Combination<CraftingComponent>): boolean;
}

class IngredientSearch implements InventorySearch {
    private readonly _ingredients: Combination<CraftingComponent>;

    constructor(ingredients: Combination<CraftingComponent>) {
        this._ingredients = ingredients;
    }

    public perform(contents: Combination<CraftingComponent>): boolean {
        return this._ingredients.isIn(contents);
    }

}

class EssenceSearch implements InventorySearch {
    private readonly _essences: Combination<EssenceDefinition>;

    constructor(essences: Combination<EssenceDefinition>) {
        this._essences = essences;
    }

    public perform(contents: Combination<CraftingComponent>): boolean {
        const remaining: Combination<EssenceDefinition> = this._essences.clone();
        for (const component of contents.members) {
            if (!component.essences.isEmpty()) {
                const essenceAmount: Combination<EssenceDefinition> = component.essences.multiply(contents.amountFor(component));
                remaining.subtract(essenceAmount);
            }
            if (remaining.isEmpty()) {
                return true;
            }
        }
        return false;
    }

}

class EssenceSelection {

    private readonly _essences: Combination<EssenceDefinition>;

    constructor(essences: Combination<EssenceDefinition>) {
        this._essences = essences;
    }

    perform(contents: Combination<CraftingComponent>): Combination<CraftingComponent> {
        let availableComponents: Combination<CraftingComponent> = contents.clone();
        contents.members.forEach(((component: CraftingComponent) => {
            if (component.essences.isEmpty() || !component.essences.intersects(this._essences)) {
                const componentsToRemove: Combination<CraftingComponent> = Combination.ofUnit(new Unit<CraftingComponent>(component, contents.amountFor(component)));
                availableComponents = availableComponents.subtract(componentsToRemove);
            }
        }));
        const sortedComponents = availableComponents.asUnits().sort(((left: Unit<CraftingComponent>, right: Unit<CraftingComponent>) => left.part.essences.size() - right.part.essences.size()));
        let remainingEssences: Combination<EssenceDefinition> = this._essences.clone();
        const selectedComponents: Unit<CraftingComponent>[] = [];
        for (let i = 0; i < sortedComponents.length; i++) {
            const thisComponent: Unit<CraftingComponent> = sortedComponents[i];
            let quantitySelected: number = 0;
            for (let j = 0; j < thisComponent.quantity; j++) {
                if (thisComponent.part.essences.intersects(remainingEssences)) {
                    remainingEssences.subtract(thisComponent.part.essences);
                    quantitySelected++;
                }
            }
            selectedComponents.push(thisComponent.withQuantity(quantitySelected));
            if (remainingEssences.isEmpty()) {
                return Combination.ofUnits(selectedComponents);
            }
        }
        return Combination.EMPTY;
    }

}

class CraftingInventory<I extends Item, A extends Actor<Actor.Data, I>> implements Inventory<I, A> {

    private readonly _actor: A;
    private readonly _ownedComponents: Combination<CraftingComponent>;
    private readonly _managedItems: Map<CraftingComponent, I[]>;

    constructor(builder: CraftingInventory.Builder<I, A>) {
        this._actor = builder.actor;
        this._ownedComponents = builder.ownedComponents;
        this._managedItems = builder.managedItems;
    }

    public static builder<I extends Item, A extends Actor<Actor.Data, I>>(): CraftingInventory.Builder<I, A> {
        return new CraftingInventory.Builder<I, A>();
    }

    get actor(): A {
        return this._actor;
    }

    get ownedComponents(): Combination<CraftingComponent> {
        return this._ownedComponents.clone();
    }

    containsIngredients(ingredients: Combination<CraftingComponent>): boolean {
        return new IngredientSearch(ingredients).perform(this.ownedComponents);
    }

    containsEssences(essences: Combination<EssenceDefinition>): boolean {
        return new EssenceSearch(essences).perform(this.ownedComponents);
    }

    excluding(ingredients: Combination<CraftingComponent>): Inventory<I, A> {
        return CraftingInventory.builder<I, A>()
            .withActor(this._actor)
            .withOwnedComponents(this._ownedComponents.subtract(ingredients))
            .withManagedItems(this._managedItems)
            .build();
    }

    selectFor(essences: Combination<EssenceDefinition>): Combination<CraftingComponent> {
        return new EssenceSelection(essences).perform(this.ownedComponents);
    }

    addAll(): Promise<FabricationAction[]> {
        throw new Error('Crafting Inventories present are immutable views of the underlying Actor Data. ' +
            'To add items, use a child type of Crafting Inventory that understands Item data structures ' +
            'for the game system, e.g. Inventory5e for dnd5e');
    }

    removeAll(): Promise<FabricationAction[]> {
        throw new Error('Crafting Inventories present are immutable views of the underlying Actor Data. ' +
            'To remove items, use a child type of Crafting Inventory that understands Item data structures ' +
            'for the game system, e.g. Inventory5e for dnd5e');
    }



}

namespace CraftingInventory {

    export class Builder<I extends Item, A extends Actor<Actor.Data, I>> {

        public actor: A;
        public ownedComponents: Combination<CraftingComponent>;
        public managedItems: Map<CraftingComponent, I[]>;

        public build(): Inventory<I, A> {
            return new CraftingInventory(this);
        }

        public withActor(value: A): Builder<I, A> {
            this.actor = value;
            return this;
        }

        public withOwnedComponents(value: Combination<CraftingComponent>): Builder<I, A> {
            this.ownedComponents = value;
            return this;
        }

        public withManagedItems(value: Map<CraftingComponent, I[]>): Builder<I, A> {
            this.managedItems = value;
            return this;
        }

    }

}

export {Inventory, CraftingInventory}