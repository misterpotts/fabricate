import {CraftingComponent} from "./CraftingComponent";
import {ActionType} from "./ActionType";
import {FabricationAction} from "./FabricationAction";
import {Inventory, InventoryModification} from "../game/Inventory";
import {FabricationOutcome, OutcomeType} from "./FabricationOutcome";
import {InventoryRecord} from "../game/InventoryRecord";
import {Recipe} from "./Recipe";

class FabricationHelper {

    private static readonly primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    public static async takeActionsForOutcome(inventory: Inventory, fabricationActions: FabricationAction[], outcome: OutcomeType, recipe?: Recipe): Promise<FabricationOutcome> {
        const inventoryModifications: InventoryModification<CraftingComponent>[] = await FabricationHelper.applyResults(fabricationActions, inventory);
        const addedItems: Item[] = inventoryModifications.filter((modification: InventoryModification<CraftingComponent>) => modification.action === ActionType.ADD)
            .map((additiveChange: InventoryModification<CraftingComponent>) => additiveChange.changedItems)
            .reduce((left: Item[], right: Item[]) => left.concat(right), []);

        return FabricationOutcome.builder()
            .withActions(fabricationActions)
            .withOutcomeType(outcome)
            .withDisplayItems(addedItems)
            .withRecipe(recipe)
            .build();
    }

    public static asCraftingResults(components: CraftingComponent[], action: ActionType): FabricationAction[] {
        const componentsById: Map<string, CraftingComponent[]> = new Map();
        components.forEach((component: CraftingComponent) => {
            const identicalComponents: CraftingComponent[] = componentsById.get(component.partId);
            if (!identicalComponents) {
                componentsById.set(component.partId, [component]);
            } else {
                identicalComponents.push(component);
            }
        });
        if (Object.keys(componentsById).length === components.length) {
            return components.map((component: CraftingComponent) => {
                return FabricationAction.builder()
                    .withComponent(component)
                    .withQuantity(1)
                    .withAction(action)
                    .build();
            });
        }
        const results: FabricationAction[] = [];
        componentsById.forEach((componentsOfType: CraftingComponent[]) => {
            const craftingResult = FabricationAction.builder()
                .withComponent(componentsOfType[0])
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

    public static asComponentCombinations(componentRecords: InventoryRecord<CraftingComponent>[], recipe: Recipe): CraftingComponent[][] {
        const denormalizedComponents: CraftingComponent[] = [];
        componentRecords.forEach((record: InventoryRecord<CraftingComponent>) => {
            const ceiling = record.totalQuantity < recipe.essences.length ? record.totalQuantity : recipe.essences.length;
            for (let i = 0; i < ceiling; i++) {
                denormalizedComponents.push(CraftingComponent.builder()
                    .withName(record.fabricateItem.name)
                    .withEssences(record.fabricateItem.essences)
                    .withPartId(record.fabricateItem.partId)
                    .withSystemId(record.fabricateItem.systemId)
                    .withImageUrl(record.fabricateItem.imageUrl)
                    .build());
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

    public static async applyResults(craftingResults: FabricationAction[], inventory: Inventory): Promise<InventoryModification<CraftingComponent>[]> {
        const inventoryModifications: InventoryModification<CraftingComponent>[] = [];
        for (const craftingResult of craftingResults) {
            switch (craftingResult.type) {
                case ActionType.ADD:
                    if (craftingResult.customData) {
                        const inventoryModification: InventoryModification<CraftingComponent> = await inventory.addComponent(craftingResult.component, craftingResult.quantity, craftingResult.customData);
                        inventoryModifications.push(inventoryModification);
                    } else {
                        const inventoryModification: InventoryModification<CraftingComponent> = await inventory.addComponent(craftingResult.component, craftingResult.quantity);
                        inventoryModifications.push(inventoryModification);
                    }
                    break;
                case ActionType.REMOVE:
                    const inventoryModification: InventoryModification<CraftingComponent> = await inventory.removeComponent(craftingResult.component, craftingResult.quantity);
                    inventoryModifications.push(inventoryModification);
                    break;
                default:
                    throw new Error(`The Crafting Action Type ${craftingResult.type} is not supported. Allowable values are: ADD, REMOVE. `);
            }
        }
        return inventoryModifications;
    }

}

export {FabricationHelper}