import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";

const registeredNodes: Map<string, any[]> = new Map();
const eventBus = function(node: any, eventTypes: string[] | string) {

    if (typeof eventTypes === "string") {
        eventTypes = [eventTypes];
    }
    eventTypes.forEach(eventType => {
        if (!registeredNodes.has(eventType)) {
            registeredNodes.set(eventType, []);
        }
        registeredNodes.get(eventType).push(node);
    });

    return {
        destroy(n: any) {
            console.log(n);
        }
    };

}

function craftingSystemUpdated(craftingSystem: CraftingSystem) {
    const eventType = "craftingSystemUpdated";
    const event = new CustomEvent(eventType, { bubbles: false, detail: craftingSystem });
    dispatch(eventType, event);
}

function componentUpdated(craftingComponent: CraftingComponent) {
    const eventType = "componentUpdated";
    const event = new CustomEvent(eventType, { bubbles: true, detail: craftingComponent });
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
export { componentUpdated, craftingSystemUpdated, itemUpdated, itemDeleted, itemCreated }