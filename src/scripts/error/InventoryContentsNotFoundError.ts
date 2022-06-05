import {CraftingComponent} from "../common/CraftingComponent";
import {Unit} from "../common/Combination";

class InventoryContentsNotFoundError extends Error {

    constructor(wanted: Unit<CraftingComponent>, foundQuantity: number, actorId: string) {
        const message: string = `Needed to remove ${wanted.quantity} ${wanted.part.name} from the inventory of Actor 
            ${actorId} to complete crafting, but found only ${foundQuantity}. `;
        super(message);
    }

}

export {InventoryContentsNotFoundError}