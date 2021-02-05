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
        if ((this.listCraftableRecipes().filter((candidate: Recipe) => candidate.entryId === recipe.entryId)).length !== 1) {
            throw new Error(`There are insufficient components available to craft Recipe ${recipe.entryId}. `)
        }
        const usableComponents:  CraftingComponent[] = this._inventory.denormalizedContents()
            .filter((component: CraftingComponent) => {
                return component.essences.filter((essence: string) => recipe.essences.includes(essence)).length > 0;
            });
        const essenceIdentities: Map<string, number> = this.assignEssenceIdentities(recipe.essences);
        const recipeIdentity = this.essenceCombinationIdentity(recipe.essences, essenceIdentities);
        const combinationHistogram: CraftingComponent[][] = this.combinationHistogram(usableComponents);
        const match: CraftingComponent[] = combinationHistogram.find((combination: CraftingComponent[]) => {
            const combinationEssences = combination.map((component: CraftingComponent) => component.essences)
                .reduce((left: string[], right: string[]) => left.concat(right), []);
            return this.essenceCombinationIdentity(combinationEssences, essenceIdentities) === recipeIdentity;
        });
        if (match && match.length > 0) {
            return this.asCraftingResults(match, ActionType.REMOVE).concat(recipe.results);
        }
        const smallestSuperset: CraftingComponent[] = combinationHistogram.find((combination: CraftingComponent[]) => {
            const essences = combination.map((component: CraftingComponent) => component.essences)
                .reduce((left: string[], right: string[]) => left.concat(right), []);
            return essences.every((essence: string) => recipe.essences.includes(essence)
                &&  (essences.filter((essence:string) => essence === essence).length <= recipe.essences.filter((essence:string) => essence === essence).length));
        });
        return this.asCraftingResults(smallestSuperset, ActionType.REMOVE).concat(recipe.results);
    }

    private asCraftingResults(components: CraftingComponent[], action: ActionType): CraftingResult[] {
        return components.map((component: CraftingComponent) => {
            return CraftingResult.builder()
                .withItem(component)
                .withQuantity(1)
                .withAction(action)
                .build();
        });
    };

    private essenceCombinationIdentity(essences: string[], essenceIdentities: Map<string, number>): number {
        return essences.map((essence: string) => essenceIdentities.get(essence))
            .reduce((left, right) => left * right);
    }

    private assignEssenceIdentities(essences: string[]): Map<string, number> {
        const uniqueEssences = essences.filter((essence: string, index: number, collection: string[]) => collection.indexOf(essence) === index)
            .sort((left, right) => left.localeCompare(right));
        const primes = this.generatePrimes(uniqueEssences.length);
        const essenceIdentities: Map<string, number> = new Map();
        uniqueEssences.forEach((value, index) => essenceIdentities.set(value, primes[index]));
        return essenceIdentities;
    }

    private generatePrimes(quantity: number): number[] {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
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

}

export {Fabricator, DefaultFabricator, EssenceCombiningFabricator};