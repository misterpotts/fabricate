import {CraftingComponent} from "./CraftingComponent";
import {EssenceDefinition} from "./EssenceDefinition";
import {Combination, Unit} from "./Combination";
import {FabricationAction} from "./FabricationAction";

interface Inventory<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> {
    actor: A;
    ownedComponents: Combination<CraftingComponent>;
    containsIngredients(ingredients: Combination<CraftingComponent>): boolean;
    containsEssences(essences: Combination<EssenceDefinition>): boolean;
    selectFor(essences: Combination<EssenceDefinition>): Combination<CraftingComponent>;
    excluding(ingredients: Combination<CraftingComponent>): Inventory<D, A>;
    removeAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]>;
    addAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]>;
    createAll(itemData: D[]): Promise<FabricationAction[]>;
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
        let remaining: Combination<EssenceDefinition> = this._essences.clone();
        for (const component of contents.members) {
            if (!component.essences.isEmpty()) {
                const essenceAmount: Combination<EssenceDefinition> = component.essences.multiply(contents.amountFor(component));
                remaining = remaining.subtract(essenceAmount);
            }
            if (remaining.isEmpty()) {
                return true;
            }
        }
        return false;
    }
}

class ComponentCombinationNode {
    private readonly _requiredEssences: Combination<EssenceDefinition>;
    private readonly _componentCombination: Combination<CraftingComponent>;
    private readonly _essenceCombination: Combination<EssenceDefinition>;
    private readonly _remainingPicks: Combination<CraftingComponent>;

    private _children: ComponentCombinationNode[];

    constructor(requiredEssences: Combination<EssenceDefinition>, nodeCombination: Combination<CraftingComponent>, remainingPicks: Combination<CraftingComponent>) {
        this._requiredEssences = requiredEssences;
        this._componentCombination = nodeCombination;
        this._remainingPicks = remainingPicks;
        this._essenceCombination = nodeCombination.explode((component: CraftingComponent) => component.essences);
    }

    public populate(): void {
        if (this._requiredEssences.isIn(this._essenceCombination)) {
            return;
        }
        this._children = this._remainingPicks.members.map((component: CraftingComponent) => {
            const deltaUnit = new Unit(component, 1);
            const childComponentCombination: Combination<CraftingComponent> = this._componentCombination.add(deltaUnit);
            const remainingPicksForChild: Combination<CraftingComponent> = this._remainingPicks.subtract(Combination.ofUnit(deltaUnit));
            return new ComponentCombinationNode(this._requiredEssences, childComponentCombination, remainingPicksForChild);
        });
        this._children.forEach((child: ComponentCombinationNode) => child.populate());
    }

    get componentCombination(): Combination<CraftingComponent> {
        return this._componentCombination;
    }

    get essenceCombination(): Combination<EssenceDefinition> {
        return this._essenceCombination;
    }

    public hasChildren(): boolean {
        return this.children && this.children.length > 0;
    }

    get children(): ComponentCombinationNode[] {
        return this._children;
    }
}

class ComponentCombinationGenerator {
    private readonly _roots: ComponentCombinationNode[];
    private readonly _requiredEssences: Combination<EssenceDefinition>;

    constructor(availableComponents: Combination<CraftingComponent>, requiredEssences: Combination<EssenceDefinition>) {
        this._requiredEssences = requiredEssences;
        this._roots = availableComponents.members
            .map((component: CraftingComponent) => Combination.ofUnit(new Unit<CraftingComponent>(component, 1)))
            .map((combination: Combination<CraftingComponent>) => new ComponentCombinationNode(requiredEssences, combination, availableComponents.subtract(combination)));
    }

    private allCombinations(baseNodes: ComponentCombinationNode[]): ComponentCombinationNode[] {
        const generatedCombinations: ComponentCombinationNode[] = [];
        let treeLevel: ComponentCombinationNode[] = baseNodes;
        while (treeLevel.length > 0) {
            treeLevel.forEach((node: ComponentCombinationNode) => {
                generatedCombinations.push(node);
            });
            treeLevel = treeLevel.filter((node: ComponentCombinationNode) => node.hasChildren())
                .map((node: ComponentCombinationNode) => node.children)
                .reduce((left: ComponentCombinationNode[], right: ComponentCombinationNode[]) => left.concat(right), []);
        }
        return generatedCombinations;
    }

    private excludeInsufficient(allCombinations: ComponentCombinationNode[], requiredEssences: Combination<EssenceDefinition>): ComponentCombinationNode[]  {
        return allCombinations.filter((node: ComponentCombinationNode) => node.essenceCombination.size() >= requiredEssences.size()
                && requiredEssences.isIn(node.essenceCombination));
    }

    private excludeDuplicates(sufficientCombinations: ComponentCombinationNode[]): [Combination<CraftingComponent>, Combination<EssenceDefinition>][] {
        const suitableCombinationsBySize: Map<number, [Combination<CraftingComponent>, Combination<EssenceDefinition>][]> = new Map();
        sufficientCombinations.forEach((node: ComponentCombinationNode) => {
            if (!suitableCombinationsBySize.has(node.componentCombination.size())) {
                suitableCombinationsBySize.set(node.componentCombination.size(), [[node.componentCombination, node.essenceCombination]]);
            } else {
                let duplicate: boolean = false;
                const existing: [Combination<CraftingComponent>, Combination<EssenceDefinition>][] = suitableCombinationsBySize.get(node.componentCombination.size());
                for (const existingCombination of existing) {
                    if (existingCombination[0].equals(node.componentCombination)) {
                        duplicate = true;
                        break;
                    }
                }
                if (!duplicate) {
                    existing.push([node.componentCombination, node.essenceCombination]);
                }
            }
        });
        return Array.from(suitableCombinationsBySize.values(), (combinations: [Combination<CraftingComponent>, Combination<EssenceDefinition>][]) => combinations)
            .reduce((left: [Combination<CraftingComponent>, Combination<EssenceDefinition>][], right: [Combination<CraftingComponent>, Combination<EssenceDefinition>][]) => left.concat(right), []);
    }

    public generate(): [Combination<CraftingComponent>, Combination<EssenceDefinition>][] {
        this._roots.forEach((node: ComponentCombinationNode) => node.populate());
        const generatedCombinations: ComponentCombinationNode[] = this.allCombinations(this._roots);
        const suitableCombinations: ComponentCombinationNode[] = this.excludeInsufficient(generatedCombinations, this._requiredEssences);
        return this.excludeDuplicates(suitableCombinations);
    }
}

class EssenceSelection {

    private readonly _essences: Combination<EssenceDefinition>;

    constructor(essences: Combination<EssenceDefinition>) {
        this._essences = essences;
    }

    perform(contents: Combination<CraftingComponent>): Combination<CraftingComponent> {
        let availableComponents: Combination<CraftingComponent> = contents.clone();
        contents.members.forEach(((thisComponent: CraftingComponent) => {
            if (thisComponent.essences.isEmpty() || !thisComponent.essences.intersects(this._essences)) {
                availableComponents = availableComponents.subtract(availableComponents.just(thisComponent));
            }
        }));
        return this.selectBestMatch(this.matchingCombinationsFor(availableComponents, this._essences));
    }

    private selectBestMatch(combinations: [Combination<CraftingComponent>, Combination<EssenceDefinition>][]): Combination<CraftingComponent> {
        if (combinations.length === 0) {
            return Combination.EMPTY();
        }
        const sortedCombinations: [Combination<CraftingComponent>, Combination<EssenceDefinition>][] = combinations
            .sort((left: [Combination<CraftingComponent>, Combination<EssenceDefinition>], right: [Combination<CraftingComponent>, Combination<EssenceDefinition>]) => {
                return left[1].size() - right[1].size();
            });
        return sortedCombinations[0][0];
    }

    private matchingCombinationsFor(availableComponents: Combination<CraftingComponent>, requiredEssences: Combination<EssenceDefinition>): [Combination<CraftingComponent>, Combination<EssenceDefinition>][] {
        const combinationGenerator: ComponentCombinationGenerator = new ComponentCombinationGenerator(availableComponents, requiredEssences);
        return combinationGenerator.generate();
    }

}

abstract class BaseCraftingInventory<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> implements Inventory<D, A> {

    private readonly _actor: A;
    private readonly _ownedComponents: Combination<CraftingComponent>;
    private readonly _managedItems: Map<CraftingComponent, Item.Data<D>[]>;

    constructor(builder: BaseCraftingInventory.Builder<D, A>) {
        this._actor = builder.actor;
        this._ownedComponents = builder.ownedComponents;
        this._managedItems = builder.managedItems;
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

    excluding(ingredients: Combination<CraftingComponent>): Inventory<D, A> {
        return this.from(this._actor, this._ownedComponents.subtract(ingredients), this._managedItems);
    }

    selectFor(essences: Combination<EssenceDefinition>): Combination<CraftingComponent> {
        return new EssenceSelection(essences).perform(this.ownedComponents);
    }

    abstract removeAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]>;

    abstract addAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]>;

    abstract createAll(itemData: D[]): Promise<FabricationAction[]>;

    abstract from(actor: A, ownedComponents: Combination<CraftingComponent>, managedItems: Map<CraftingComponent, Item.Data<D>[]>): Inventory<D, A>;

}

namespace BaseCraftingInventory {

    export class Builder<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> {

        public actor: A;
        public ownedComponents: Combination<CraftingComponent> = Combination.EMPTY();
        public managedItems: Map<CraftingComponent, Item.Data<D>[]> = new Map();

        public withActor(value: A): Builder<D, A> {
            this.actor = value;
            return this;
        }

        public withOwnedComponents(value: Combination<CraftingComponent>): Builder<D, A> {
            this.ownedComponents = value;
            return this;
        }

        public withManagedItems(value: Map<CraftingComponent, Item.Data<D>[]>): Builder<D, A> {
            this.managedItems = value;
            return this;
        }

    }

}

export {Inventory, BaseCraftingInventory}