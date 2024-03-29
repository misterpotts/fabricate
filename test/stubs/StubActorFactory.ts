import {StubItem} from "./StubItem";
import {Combination, DefaultCombination} from "../../src/scripts/common/Combination";
import {Component} from "../../src/scripts/crafting/component/Component";
import {ObjectUtility} from "../../src/scripts/foundry/ObjectUtility";
import {StubObjectUtility} from "./StubObjectUtility";

class StubActorFactory {

    private readonly objectUtility: ObjectUtility = new StubObjectUtility(false);
    private readonly itemQuantityPropertyPath: string;

    constructor(itemQuantityPropertyPath = "system.quantity") {
        this.itemQuantityPropertyPath = itemQuantityPropertyPath;
    }

    public make({
        ownedComponents = DefaultCombination.EMPTY(),
        additionalItemCount = 10
    }: {
        ownedComponents?: Combination<Component>;
        additionalItemCount?: number;
    } = {}): Actor {
        const items = this.generateInventory(ownedComponents, additionalItemCount);
        return <Actor><unknown>{
            id: randomIdentifier(),
            name: "Stub Actor",
            items,
            deleteEmbeddedDocuments: (type: string, ids: string[]) => {
                if (type !== "Item") {
                    throw new Error("Fabricate only deletes items. ");
                }
                ids.forEach(id => {
                    if (!items.has(id)) {
                        throw new Error(`Item ${id} is not owned by this actor. `);
                    }
                    items.delete(id);
                });
                return ids;
            },
            createEmbeddedDocuments: (type: string, itemData: any[]) => {
                if (type !== "Item") {
                    throw new Error("Fabricate only creates items. ");
                }
                const idsAssigned = itemData.map(item => {
                    item.id = randomIdentifier(Array.from(items.keys()).concat([item.id]));
                    return item;
                });
                idsAssigned.forEach(item => {
                    items.set(item.id, new StubItem({
                        id: item.id,
                        system: item.system,
                        flags: item.flags,
                        effects: item.effects
                    }));
                });
                return idsAssigned;
            },
            updateEmbeddedDocuments: (type: string, itemData: any[]) => {
                if (type !== "Item") {
                    throw new Error("Fabricate only updates items. ");
                }
                itemData.forEach(item => {
                    if (!items.has(item.id)) {
                        throw new Error(`Cannot update item ${item.id} as it is not owned by this actor. `)
                    }
                    items.set(item.id, new StubItem({
                        id: item.id,
                        system: item.system,
                        flags: item.flags,
                        effects: item.effects
                    }));
                });
                return itemData;
            }
        };
    }

    private generateInventory(ownedComponents: Combination<Component> = DefaultCombination.EMPTY(), additionalItemCount = 10): Map<string, StubItem> {
        const result: Map<string, StubItem> = new Map();
        for (let i = 0; i < additionalItemCount; i++) {
            const id = randomIdentifier();
            result.set(id, new StubItem({ id }));
        }
        ownedComponents.units.map(unit => {
            const id = randomIdentifier();
            const stubItemData = {
                id: id,
                flags: {
                    core: {
                        sourceId: unit.element.itemUuid
                    }
                }
            };
            this.objectUtility.setPropertyValue(this.itemQuantityPropertyPath,stubItemData, unit.quantity);
            result.set(id, new StubItem(stubItemData));
        });
        return result;
    }

}

export { StubActorFactory }

function randomIdentifier(excludedValues: string[] = []): string {
    const generated = (Math.random() + 1)
        .toString(36)
        .substring(2);
    if (!excludedValues.includes(generated)) {
        return generated;
    }
    return randomIdentifier(excludedValues);
}