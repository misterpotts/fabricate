import {Component} from "../crafting/component/Component";

import {Unit} from "../common/Unit";

class InventoryContentsNotFoundError extends Error {

    constructor(wanted: Unit<Component>, foundQuantity: number, actorId: string) {
        const message: string = `Needed to remove ${wanted.quantity} ${wanted.element.name} from the inventory of Actor 
            ${actorId} to complete crafting, but found only ${foundQuantity}. `;
        super(message);
    }

}

export {InventoryContentsNotFoundError}