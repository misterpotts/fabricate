import {StubItem} from "./StubItem";
import {BaseActor} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";

class StubActorFactory {

    private readonly _ownedItems: Map<string, StubItem> ;

    constructor({ ownedItems = new Map() }: { ownedItems?: Map<string, StubItem> } = {}) {
        this._ownedItems = ownedItems;
    }

    public make(): BaseActor {
        const items = new Map(this._ownedItems);
        const result: BaseActor = <BaseActor><unknown>{
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