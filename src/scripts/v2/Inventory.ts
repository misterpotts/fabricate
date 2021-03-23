import {CraftingComponent} from "./CraftingComponent";
import {InventoryRecord} from "./InventoryRecord";
import {EssenceDefinition, EssenceIdentityProvider} from "./EssenceDefinition";
import {Combination, Unit} from "./Combination";

interface Inventory<I extends Item, A extends Actor<Actor.Data, I>> {
    actor: A;
    contents: Map<CraftingComponent, InventoryRecord<I>>;
    containsIngredients(ingredients: Unit<CraftingComponent>[]): boolean;
    containsEssences(essences: Combination<EssenceDefinition>): boolean;
    selectFor(essences: Combination<EssenceDefinition>, identityProvider: EssenceIdentityProvider): Unit<CraftingComponent>[];
    excluding(ingredients: Unit<CraftingComponent>[]): Inventory<I, A>;
}

interface InventorySearch<I extends Item> {
    perform(contents: Map<CraftingComponent, InventoryRecord<I>>): boolean;
}

class IngredientSearch<I extends Item> implements InventorySearch<I> {
    private readonly _ingredients: Unit<CraftingComponent>[];

    constructor(ingredients: Unit<CraftingComponent>[]) {
        this._ingredients = ingredients;
    }

    public perform(contents: Map<CraftingComponent, InventoryRecord<I>>): boolean {
        return this._ingredients.map((ingredient)  => {
            const component: CraftingComponent = ingredient.type;
            if (!contents.has(component)) {
                return false;
            }
            const record: InventoryRecord<Item> = contents.get(component);
            const requiredQuantity = ingredient.quantity;
            if (requiredQuantity < record.totalQuantity) {
                return false;
            }
        }).reduce((previousValue, currentValue) => previousValue && currentValue, true);
    }

}

class EssenceSearch<I extends Item> implements InventorySearch<I> {
    private readonly _essences: Combination<EssenceDefinition>;

    constructor(essences: Combination<EssenceDefinition>) {
        this._essences = essences;
    }

    public perform(contents: Map<CraftingComponent, InventoryRecord<I>>): boolean {
        const remaining: Combination<EssenceDefinition> = this._essences.clone();
        for (const entry of contents) {
            const component: CraftingComponent = entry[0];
            if (component.essences) {
                const record: InventoryRecord<I> = entry[1];
                const essenceAmount: Combination<EssenceDefinition> = component.essences.multiply(record.totalQuantity);
                remaining.subtract(essenceAmount);
            }
            if (remaining.isEmpty()) {
                return true;
            }
        }
        return false;
    }

}

class EssenceSelection<I extends Item> {

    private readonly _essences: Combination<EssenceDefinition>;
    private readonly _identities: EssenceIdentityProvider;

    constructor(essences: Combination<EssenceDefinition>, identities: EssenceIdentityProvider) {
        this._essences = essences;
        this._identities = identities;
    }

    perform(contents: Map<CraftingComponent, InventoryRecord<I>>): Unit<CraftingComponent>[] {
        const availableComponents: Unit<CraftingComponent>[];
        contents.forEach(((record: InventoryRecord<I>, component: CraftingComponent) => {
            if (!component.essences || component.essences.intersects(this._essences)) {
                return;
            }
            availableComponents.push(new Unit<CraftingComponent>(component, record.totalQuantity));
        }));
    }

}


class AbstractInventory<I extends Item, A extends Actor<Actor.Data, I>> implements Inventory<I, A> {

    private readonly _actor: A;
    private readonly _contents: Map<CraftingComponent, InventoryRecord<I>> = new Map();

    constructor(builder: AbstractInventory.Builder<I, A>) {
        this._actor = builder.actor;
        this._contents = builder.contents;
    }

    get actor(): A {
        return this._actor;
    }

    get contents(): Map<CraftingComponent, InventoryRecord<I>> {
        return new Map(this._contents);
    }

    public index() {

    }

    containsIngredients(ingredients: Unit<CraftingComponent>[]): boolean {
        return new IngredientSearch(ingredients).perform(this.contents);
    }

    containsEssences(essences: Combination<EssenceDefinition>): boolean {
        return new EssenceSearch(essences).perform(this.contents);
    }

    excluding(ingredients: Unit<CraftingComponent>[]): Inventory<I, A> {
        return new ReadonlyInventory<I, A>(this, ingredients);
    }

    selectFor(essences: Combination<EssenceDefinition>, identityProvider: EssenceIdentityProvider): Unit<CraftingComponent>[] {
        return new EssenceSelection(essences, identityProvider).perform(this.contents);
    }

}

class ReadonlyInventory<I extends Item, A extends Actor<Actor.Data, I>> implements Inventory<I, A> {

    private readonly _source: Inventory<I, A>;
    private readonly _contents: Map<CraftingComponent, InventoryRecord<I>> = new Map();

    constructor(source: Inventory<I, A>, exclude?: Unit<CraftingComponent>[]) {
        this._source = source;
        const reducedComponentQuantities: Map<string, number> = new Map();
        if (exclude) {
            exclude.forEach((unit => reducedComponentQuantities.set(unit.type.partId, -Math.abs(unit.quantity))));
        }
        source.contents.forEach((sourceRecord: InventoryRecord<I>, component: CraftingComponent) => {
            if (reducedComponentQuantities.has(component.partId)) {
                this._contents.set(component, sourceRecord.readOnly(reducedComponentQuantities.get(component.partId)))
            } else {
                this._contents.set(component, sourceRecord.readOnly());
            }
        });
    }

    containsIngredients(ingredients: Unit<CraftingComponent>[]): boolean {
        return new IngredientSearch(ingredients).perform(this.contents);
    }

    containsEssences(essences: Combination<EssenceDefinition>): boolean {
        return new EssenceSearch(essences).perform(this.contents);
    }

    get actor(): A {
        return this._source.actor;
    }

    get contents(): Map<CraftingComponent, InventoryRecord<I>> {
        return new Map(this._contents);
    }

    excluding(ingredients: Unit<CraftingComponent>[]): Inventory<I, A> {
        return new ReadonlyInventory<I, A>(this, ingredients);
    }

    selectFor(essences: Combination<EssenceDefinition>, identityProvider: EssenceIdentityProvider): Unit<CraftingComponent>[] {
        return new EssenceSelection(essences, identityProvider).perform(this.contents);
    }

}

namespace AbstractInventory {

    export class Builder<I extends Item, A extends Actor<Actor.Data, I>> {

        public actor: A;
        public contents: Map<CraftingComponent, InventoryRecord<I>>;

        public withActor(value: A): Builder<I, A> {
            this.actor = value;
            return this;
        }

        public withContents(value: Map<CraftingComponent, InventoryRecord<I>>): Builder<I, A> {
            this.contents = value;
            return this;
        }

    }

}

export {Inventory, AbstractInventory}