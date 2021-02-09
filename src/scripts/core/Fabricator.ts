import {Recipe} from "./Recipe";
import {CraftingResult} from "./CraftingResult";
import {ActionType} from "./ActionType";
import {CraftingComponent} from "./CraftingComponent";
import {Inventory} from "./Inventory";

interface Fabricator {
    fabricateFromRecipe(recipe: Recipe): CraftingResult[];

    fabricateFromComponents(components: CraftingComponent[]): CraftingResult[];
}

interface EssenceCombiner {
    maxComponents: number;
    maxEssences: number;
    combine(components: CraftingComponent[]): CraftingResult[];
}

interface AlchemicalResult {
    essences: string[];
    effect:any;
}

class FabricationHelper {

    private static readonly primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    public static asCraftingResults(components: CraftingComponent[], action: ActionType): CraftingResult[] {
        const componentsById: Map<string, CraftingComponent[]> = new Map();
        components.forEach((component: CraftingComponent) => {
            const identicalComponents: CraftingComponent[] = componentsById.get(component.compendiumEntry.entryId);
            if (!identicalComponents) {
                componentsById.set(component.compendiumEntry.entryId, [component]);
            } else {
                identicalComponents.push(component);
            }
        });
        if (Object.keys(componentsById).length === components.length) {
            return components.map((component: CraftingComponent) => {
                return CraftingResult.builder()
                    .withItem(component)
                    .withQuantity(1)
                    .withAction(action)
                    .build();
            });
        }
        const results: CraftingResult[] = [];
        componentsById.forEach((componentsOfType: CraftingComponent[]) => {
            const craftingResult = CraftingResult.builder()
                .withItem(componentsOfType[0])
                .withQuantity(componentsOfType.length)
                .withAction(action)
                .build();
            results.push(craftingResult);
        });
        return results;
    };

    public static essenceCombinationIdentity(essences: string[], essenceIdentities: Map<string, number>): number {
        return essences.map((essence: string) => essenceIdentities.get(essence))
            .reduce((left, right) => left * right);
    }

    public static assignEssenceIdentities(essences: string[]): Map<string, number> {
        const uniqueEssences = essences.filter((essence: string, index: number, collection: string[]) => collection.indexOf(essence) === index);
        const primes = this.generatePrimes(uniqueEssences.length);
        const essenceIdentities: Map<string, number> = new Map();
        uniqueEssences.forEach((value, index) => essenceIdentities.set(value, primes[index]));
        return essenceIdentities;
    }

    public static generatePrimes(quantity: number): number[] {
        if (quantity <= FabricationHelper.primes.length) {
            return FabricationHelper.primes.slice(0, quantity);
        }
        let candidate = 98;
        while (FabricationHelper.primes.length < quantity) {
            if (FabricationHelper.primes.every((p) => candidate % p)) {
                FabricationHelper.primes.push(candidate);
            }
            candidate++;
        }
        return FabricationHelper.primes;
    }

    public static combinationHistogram(components:  CraftingComponent[]): CraftingComponent[][] {
        const combinations: CraftingComponent[][] = [];
        const iterations = Math.pow(2, components.length);

        for (let i = 0; i < iterations; i++) {
            const combination: CraftingComponent[] = [];
            for (let j = 0; j < components.length; j++) {
                if (i & Math.pow(2, j)) {
                    combination.push(components[j]);
                }
            }
            if (combination.length > 0) {
                combinations.push(combination);
            }
        }
        return combinations.sort((left, right) => left.length - right.length);
    }

}

abstract class AbstractEssenceCombiner implements EssenceCombiner {
    maxComponents: number;
    maxEssences: number;
    protected readonly resultsByCombinationIdentity: Map<number, AlchemicalResult> = new Map();
    protected essenceIdentities: Map<string, number> = new Map();

    protected constructor(maxComponents: number, maxEssences: number) {
        this.maxComponents = maxComponents;
        this.maxEssences = maxEssences;
        const uniqueEssences: string[] = this.availableAlchemicalResults()
            .map((essenceCombination) => essenceCombination.essences)
            .reduce((left: string[], right: string[]) => left.concat(right), [])
            .filter((essence: string, index: number, collection: string[]) => collection.indexOf(essence) === index);
        this.essenceIdentities = FabricationHelper.assignEssenceIdentities(uniqueEssences);
        this.availableAlchemicalResults().forEach((essenceCombination: AlchemicalResult) => {
            const essenceCombinationIdentity = FabricationHelper.essenceCombinationIdentity(essenceCombination.essences, this.essenceIdentities);
            if (this.resultsByCombinationIdentity.has(essenceCombinationIdentity)) {
                throw new Error(`The combination ${essenceCombination.essences} was duplicated. Each essence combination must map to a unique effect.`);
            }
            this.resultsByCombinationIdentity.set(essenceCombinationIdentity, essenceCombination);
        });
    }

    combine(components: CraftingComponent[]): CraftingResult[] {
        this.validate(components);
        const effects: AlchemicalResult[] = this.getAlchemicalResultsForComponents(components);
        return this.combineAlchemicalResults(effects);
    }

    protected validate(components: CraftingComponent[]) {
        if ((this.maxComponents > 0) && (this.maxComponents < components.length)) {
            throw new Error(`The Essence Combiner for this system supports a maximum of ${this.maxComponents} components. `);
        }
        if (this.maxEssences > 0) {
            const essenceCount = components.map((component: CraftingComponent) => component.essences.length)
                .reduce((left: number, right: number) => left + right, 0);
            if (essenceCount > this.maxEssences) {
                throw new Error(`The Essence Combiner for this system supports a maximum of ${this.maxEssences} essences. `);
            }
        }
    }

    abstract combineAlchemicalResults(effects: AlchemicalResult[]): CraftingResult[];

    getAlchemicalResultsForComponents(components: CraftingComponent[]): AlchemicalResult[] {
        return components.map((component: CraftingComponent) => this.resultsByCombinationIdentity.get(this.getEssenceCombinationIdentity(component.essences)));
    }

    abstract availableAlchemicalResults(): AlchemicalResult[];

    private getEssenceCombinationIdentity(essences: string[]) {
        return FabricationHelper.essenceCombinationIdentity(essences, this.essenceIdentities);
    }
}

class DefaultFabricator implements Fabricator {

    public fabricateFromRecipe(recipe: Recipe): CraftingResult[] {

        let input: CraftingResult[] = recipe.ingredients.map((component) => {
            return CraftingResult.builder()
                .withItem(component.componentType)
                .withQuantity(component.quantity)
                .withAction(component.consumed ? ActionType.REMOVE : ActionType.ADD)
                .build();
        });

        let output: CraftingResult[] = recipe.results.map((result) => {
            return CraftingResult.builder()
                .withItem(result.item)
                .withAction(ActionType.ADD)
                .withQuantity(result.quantity)
                .build();
        });

        return input.concat(output);

    }

    public fabricateFromComponents(): CraftingResult[] {
        throw new Error(`The Default Fabricator requires a Recipe and one was not provided. `);
    }

}

class EssenceCombiningFabricator {
    private readonly _knownRecipesById: Map<string, Recipe>;
    private readonly _inventory: Inventory;
    private readonly _essenceCombiner: EssenceCombiner;

    constructor(knownRecipes: Recipe[], inventory: Inventory, essenceCombiner?: EssenceCombiner) {
        this._inventory = inventory;
        this._essenceCombiner = essenceCombiner;
        this._knownRecipesById = new Map();
        knownRecipes.forEach((recipe: Recipe) => {
            if (this._knownRecipesById.has(recipe.entryId)) {
                throw new Error(`Recipe ${recipe.entryId} is not unique! `);
            }
            this._knownRecipesById.set(recipe.entryId, recipe);
        });
    }

    public fabricateFromComponents(components: CraftingComponent[]): CraftingResult[] {
        if (!this._essenceCombiner) {
            throw new Error(`No Essence Combiner has been provided for this system. You may only craft from Recipes. `);
        }
        return this._essenceCombiner.combine(components);
    }

    public fabricateFromRecipe(recipe: Recipe): CraftingResult[] {
        if (!this._knownRecipesById.has(recipe.entryId)) {
            throw new Error(`Recipe ${recipe.entryId} is not known and cannot be crafted. `);
        }
        const craftingComponentCombinations = this.analyzeCombinationsForRecipe(this._inventory.denormalizedContents(), recipe);
        const selectedCombination: CraftingComponent[] = this.selectBestCombinationFrom(recipe, craftingComponentCombinations);
        if (!selectedCombination ||selectedCombination.length === 0) {
            throw new Error(`There are insufficient components available to craft Recipe ${recipe.entryId}. `)
        }
        return FabricationHelper.asCraftingResults(selectedCombination, ActionType.REMOVE).concat(recipe.results);
    }

    private analyzeCombinationsForRecipe(components:  CraftingComponent[], recipe: Recipe): CraftingComponentCombination[] {
        const essenceIdentities: Map<string, number> = FabricationHelper.assignEssenceIdentities(recipe.essences);
        const usableComponents: CraftingComponent[] = components.filter((component: CraftingComponent) => component.essences.filter((essence: string) => recipe.essences.includes(essence)).length > 0);
        const recipeIdentity = FabricationHelper.essenceCombinationIdentity(recipe.essences, essenceIdentities);
        const componentEssenceIdentity: Map<string, number> = new Map();
        usableComponents.forEach((component: CraftingComponent) => {
            if (!componentEssenceIdentity.has(component.compendiumEntry.entryId)) {
                componentEssenceIdentity.set(component.compendiumEntry.entryId, FabricationHelper.essenceCombinationIdentity(component.essences, essenceIdentities));
            }
        });
        return FabricationHelper.combinationHistogram(usableComponents).map((combination: CraftingComponent[]) => {
            const essenceCombinationIdentity = combination.map((component: CraftingComponent) => componentEssenceIdentity.get(component.compendiumEntry.entryId))
                .reduce((left: number, right: number) => left * right, 1);
            const craftableRecipes: Recipe[] = [];
            if (this.isCraftableFromEssencesIn(recipe, combination)) {
                craftableRecipes.push(recipe);
            }
            const essenceIdentityMatchForRecipes: Recipe[] = [];
            if (essenceCombinationIdentity === recipeIdentity) {
                essenceIdentityMatchForRecipes.push(recipe);
            }
            return new CraftingComponentCombination(combination, craftableRecipes, essenceCombinationIdentity, essenceIdentityMatchForRecipes);
        });
    }

    private isCraftableFromEssencesIn(recipe: Recipe, components: CraftingComponent[]): boolean {
        const essences = components.map((component: CraftingComponent) => component.essences)
            .reduce((left: string[], right: string[]) => left.concat(right), []);
        return essences.every((essence: string) => recipe.essences.includes(essence)
            &&  (essences.filter((essence:string) => essence === essence).length >= recipe.essences.filter((essence:string) => essence === essence).length));
    }

    public listCraftableRecipes(craftingComponents?: CraftingComponent[]) {
        if(!craftingComponents) {
            craftingComponents = this._inventory.denormalizedContents();
        }
        return Array.from(this._knownRecipesById.values()).filter((recipe: Recipe) => this.isCraftableFromEssencesIn(recipe, craftingComponents));
    }

    private selectBestCombinationFrom(recipe: Recipe, combinations: CraftingComponentCombination[]): CraftingComponent[] {
        const exactMatches: CraftingComponentCombination[] = [];
        const supersets: CraftingComponentCombination[] = [];
        combinations.forEach((combination: CraftingComponentCombination) => {
            if (combination.essenceIdentityMatches.find((match: Recipe) => match.entryId === recipe.entryId)) {
                exactMatches.push(combination);
            }
            if (combination.craftableRecipes.find((craftable: Recipe) => craftable.entryId === recipe.entryId)) {
                supersets.push(combination);
            }
        });
        const selectFewestComponents = (combinations: CraftingComponentCombination[]) => {
            return combinations.sort((left, right) => left.components.length - right.components.length)
                .find(() => true)
                .components;
        };
        if ( exactMatches.length === 1) {
            return exactMatches[0].components;
        } else if ( exactMatches.length > 1) {
            return selectFewestComponents(exactMatches);
        } else if (supersets.length === 1) {
            return supersets[0].components;
        } else if (supersets.length > 1) {
            return selectFewestComponents(supersets);
        } else {
            return [];
        }
    }
}

class CraftingComponentCombination {

    private readonly _components: CraftingComponent[];
    private readonly _craftableRecipes: Recipe[];
    private readonly _essenceIdentityMatches: Recipe[];
    private readonly _essenceIdentity: number;

    constructor(components: CraftingComponent[], craftableRecipes: Recipe[], essenceIdentity: number, essencceIdentityMatches: Recipe[]) {
        this._components = components;
        this._craftableRecipes = craftableRecipes;
        this._essenceIdentity = essenceIdentity;
        this._essenceIdentityMatches = essencceIdentityMatches;
    }

    get components(): CraftingComponent[] {
        return this._components;
    }

    get craftableRecipes(): Recipe[] {
        return this._craftableRecipes;
    }

    get essenceIdentity(): number {
        return this._essenceIdentity;
    }

    get essenceIdentityMatches(): Recipe[] {
        return this._essenceIdentityMatches;
    }
}

export {Fabricator, DefaultFabricator, EssenceCombiningFabricator, AlchemicalResult, EssenceCombiner, AbstractEssenceCombiner};