import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingChatMessage} from "../../interface/CraftingChatMessage";

interface CraftingResult {

    consumed: Combination<CraftingComponent>;
    created: Combination<CraftingComponent>;
    describe(): CraftingChatMessage;

}

export { CraftingResult }