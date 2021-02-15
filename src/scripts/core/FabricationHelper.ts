import {CraftingComponent} from "./CraftingComponent";
import {ActionType} from "./ActionType";
import {CraftingResult} from "./CraftingResult";

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

export {FabricationHelper}