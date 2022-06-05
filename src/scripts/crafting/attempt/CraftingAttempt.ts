import {CraftingResult} from "../result/CraftingResult";

interface CraftingAttempt {

    perform(): CraftingResult;

}

export {CraftingAttempt}