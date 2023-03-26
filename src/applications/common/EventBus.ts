import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {Component} from "../../scripts/crafting/component/Component";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";

const registeredNodes: Map<string, any[]> = new Map();
const eventBus = function(node: any, eventTypes: string[] | string) {
    const nodeId = randomID();
    node.__fabricateMetadata = {
        id: nodeId
    }
    if (typeof eventTypes === "string") {
        eventTypes = [eventTypes];
    }
    eventTypes.forEach(eventType => {
        if (!registeredNodes.has(eventType)) {
            registeredNodes.set(eventType, []);
        }
        const subscribers = registeredNodes.get(eventType);
        if (subscribers.find(subscriber => subscriber === node)) {
            return;
        }
        subscribers.push(node);
    });

    return {
        destroy() {
            Array.from(registeredNodes.keys())
                .forEach(eventType => {
                    const cleanedSubscribers = registeredNodes.get(eventType).filter(node => node.__fabricateMetadata.id !== nodeId);
                    registeredNodes.set(eventType, cleanedSubscribers);
                });
        },
        update(_eventTypes: string[] | string) {
            throw new Error("Fabricate UI event subscriptions cannot be changed. Destroy and re-create the component or node instead. ");
        }
    };

}

function craftingSystemUpdated(craftingSystem: CraftingSystem) {
    const eventType = "craftingSystemUpdated";
    const event = new CustomEvent(eventType, { bubbles: false, detail: craftingSystem });
    dispatch(eventType, event);
}

function componentUpdated(craftingComponent: Component) {
    const eventType = "componentUpdated";
    const event = new CustomEvent(eventType, { bubbles: true, detail: craftingComponent });
    dispatch(eventType, event);
}

function recipeUpdated(recipe: Recipe) {
    const eventType = "recipeUpdated";
    const event = new CustomEvent(eventType, { bubbles: true, detail: recipe });
    dispatch(eventType, event);
}

function itemUpdated(item: any) {
    const eventType = "itemUpdated";
    const actor = item.actor;
    const sourceId = item.getFlag("core", "sourceId");
    const event = new CustomEvent(eventType, { bubbles: true, detail: { item, sourceId, actor } });
    dispatch(eventType, event);
}

function itemCreated(item: any) {
    const eventType = "itemCreated";
    const actor = item.actor;
    const sourceId = item.getFlag("core", "sourceId");
    const event = new CustomEvent(eventType, { bubbles: true, detail: { item, sourceId, actor } });
    dispatch(eventType, event);
}

function itemDeleted(item: any) {
    const eventType = "itemDeleted";
    const actor = item.actor;
    const sourceId = item.getFlag("core", "sourceId");
    const event = new CustomEvent(eventType, { bubbles: true, detail: { item, sourceId, actor } });
    dispatch(eventType, event);
}

function dispatch(eventType: string, event: CustomEvent) {
    if (!registeredNodes.has(eventType)) {
        return;
    }
    registeredNodes.get(eventType).forEach(node => {
        node.dispatchEvent(event);
    });
}

export default eventBus;
export { componentUpdated, craftingSystemUpdated, itemUpdated, itemDeleted, itemCreated, recipeUpdated }