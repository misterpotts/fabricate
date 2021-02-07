import {Recipe} from "./Recipe";
import {CraftingResult} from "./CraftingResult";
import {ActionType} from "./ActionType";
import {CraftingComponent} from "./CraftingComponent";
import {Inventory} from "./Inventory";

interface Fabricator {
    fabricateFromRecipe(recipe: Recipe): CraftingResult[];

    fabricateFromComponents(): CraftingResult[];
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

    constructor(knownRecipes: Recipe[], inventory: Inventory) {
        this._inventory = inventory;
        this._knownRecipesById = new Map();
        knownRecipes.forEach((recipe: Recipe) => {
            if (this._knownRecipesById.has(recipe.entryId)) {
                throw new Error(`Recipe ${recipe.entryId} is not unique! `);
            }
            this._knownRecipesById.set(recipe.entryId, recipe);
        });
    }

    public fabricateFromComponents(): CraftingResult[] {
        return [];
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
        return this.asCraftingResults(selectedCombination, ActionType.REMOVE).concat(recipe.results);
    }

    private analyzeCombinationsForRecipe(components:  CraftingComponent[], recipe: Recipe): CraftingComponentCombination[] {
        const essenceIdentities: Map<string, number> = this.assignEssenceIdentities(recipe.essences);
        const usableComponents: CraftingComponent[] = components.filter((component: CraftingComponent) => component.essences.filter((essence: string) => recipe.essences.includes(essence)).length > 0);
        const recipeIdentity = this.essenceCombinationIdentity(recipe.essences, essenceIdentities);
        const componentEssenceIdentity: Map<string, number> = new Map();
        usableComponents.forEach((component: CraftingComponent) => {
            if (!componentEssenceIdentity.has(component.compendiumEntry.entryId)) {
                componentEssenceIdentity.set(component.compendiumEntry.entryId, this.essenceCombinationIdentity(component.essences, essenceIdentities));
            }
        });
        return this.combinationHistogram(usableComponents).map((combination: CraftingComponent[]) => {
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

    private asCraftingResults(components: CraftingComponent[], action: ActionType): CraftingResult[] {
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

    private essenceCombinationIdentity(essences: string[], essenceIdentities: Map<string, number>): number {
        return essences.map((essence: string) => essenceIdentities.get(essence))
            .reduce((left, right) => left * right);
    }

    private assignEssenceIdentities(essences: string[]): Map<string, number> {
        const uniqueEssences = essences.filter((essence: string, index: number, collection: string[]) => collection.indexOf(essence) === index);
        const primes = this.generatePrimes(uniqueEssences.length);
        const essenceIdentities: Map<string, number> = new Map();
        uniqueEssences.forEach((value, index) => essenceIdentities.set(value, primes[index]));
        return essenceIdentities;
    }

    private generatePrimes(quantity: number): number[] {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        if (quantity <= primes.length) {
            return primes.slice(0, quantity);
        }
        let candidate = 98;
        while (primes.length < quantity) {
            if (primes.every((p) => candidate % p)) {
                primes.push(candidate);
            }
            candidate++;
        }
        return primes;
    }

    private combinationHistogram(components:  CraftingComponent[]): CraftingComponent[][] {
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

    public listCraftableRecipes(craftingComponents?: CraftingComponent[]) {
        if(!craftingComponents) {
            craftingComponents = this._inventory.denormalizedContents();
        }
        const essencesPresent:string[] = craftingComponents.map((component: CraftingComponent) => component.essences)
            .reduce((left, right) => left.concat(right), []);
        return Array.from(this._knownRecipesById.values()).filter((recipe: Recipe) => {
            return recipe.essences.every((essence: string) => {
                return essencesPresent.includes(essence)
                    && (recipe.essences.filter((essence: string) => essence === essence).length <= essencesPresent.filter((essence: string) => essence === essence).length);
            });
        });
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

export {Fabricator, DefaultFabricator, EssenceCombiningFabricator};