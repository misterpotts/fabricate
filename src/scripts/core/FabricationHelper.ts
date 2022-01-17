import {CraftingComponent} from "./CraftingComponent";
import {FabricationAction, ActionType} from "./FabricationAction";
import {Inventory} from "../game/Inventory";
import {Ingredient} from "./Ingredient";
import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";


class FabricationHelper {

    private static readonly primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    public static asCraftingResults(components: CraftingComponent[], action: ActionType): FabricationAction[] {
        const componentsById: Map<string, CraftingComponent[]> = new Map();
        components.forEach((component: CraftingComponent) => {
            const identicalComponents: CraftingComponent[] = <CraftingComponent[]>componentsById.get(component.partId);
            if (!identicalComponents) {
                componentsById.set(component.partId, [component]);
            } else {
                identicalComponents.push(component);
            }
        });
        if (Object.keys(componentsById).length === components.length) {
            return components.map((component: CraftingComponent) => {
                return FabricationAction.builder()
                    .withItemType(component)
                    .withQuantity(1)
                    .withActionType(action)
                    .build();
            });
        }
        const results: FabricationAction[] = [];
        componentsById.forEach((componentsOfType: CraftingComponent[]) => {
            const craftingResult = FabricationAction.builder()
                .withItemType(componentsOfType[0])
                .withQuantity(componentsOfType.length)
                .withActionType(action)
                .build();
            results.push(craftingResult);
        });
        return results;
    };

    public static essenceCombinationIdentity(essences: string[], essenceIdentities: Map<string, number>): number {
        return essences.map((essence: string) => {
            if (!essenceIdentities.has(essence)) {
                throw new Error(`No known essence is registered for the slug '${essence}'. Known essences are: ${Array.from(essenceIdentities.keys()).join(', ')}`);
            }
            return essenceIdentities.get(essence);
        })
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

    public static asComponentCombinations(availableIngredients: Ingredient[], limit: number): CraftingComponent[][] {
        const denormalizedComponents: CraftingComponent[] = [];
        availableIngredients.forEach((ingredient: Ingredient) => {
            const ceiling = ingredient.quantity < limit ? ingredient.quantity : limit;
            for (let i = 0; i < ceiling; i++) {
                denormalizedComponents.push(ingredient.component);
            }
        });
        const combinations: CraftingComponent[][] = [];
        const iterations = Math.pow(2, denormalizedComponents.length);

        for (let i = 0; i < iterations; i++) {
            const combination: CraftingComponent[] = [];
            for (let j = 0; j < denormalizedComponents.length; j++) {
                if (i & Math.pow(2, j)) {
                    combination.push(denormalizedComponents[j]);
                }
            }
            if (combination.length > 0) {
                combinations.push(combination);
            }
        }
        return combinations.sort((left, right) => left.length - right.length);
    }

    public static async applyResults(actions: FabricationAction<ItemData>[], inventory: Inventory): Promise<boolean> {
        for (const action of actions) {
            switch (action.actionType) {
                case ActionType.ADD:
                    if (action.customData) {
                        //@ts-ignore
                        await inventory.add(action.itemData.type, action.itemData.quantity, action.customData);
                    } else {
                        //@ts-ignore
                        await inventory.add(action.itemData.type, action.itemData.quantity);
                    }
                    break;
                case ActionType.REMOVE:
                    //@ts-ignore
                    await inventory.remove(action.itemData.type, action.itemData.quantity);
                    break;
                default:
                    throw new Error(`The Crafting Action Type ${action.actionType} is not supported. Allowable values are: ADD, REMOVE. `);
            }
        }
        return true;
    }

}

export {FabricationHelper}