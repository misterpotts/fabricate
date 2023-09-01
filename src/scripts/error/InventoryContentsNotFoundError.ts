import {Component} from "../crafting/component/Component";

import {Unit} from "../common/Unit";

class InventoryContentsNotFoundError extends Error {

    constructor(wanted: Unit<Component>, foundQuantity: number) {
        const message: string = `Needed to remove ${wanted.quantity} ${wanted.element.name} from an inventory to complete crafting, but found only ${foundQuantity}. `;
        super(message);
    }

}

export {InventoryContentsNotFoundError}