import {CraftingResult} from "./CraftingResult";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";
import {CraftingChatMessage, IconType} from "../../interface/CraftingChatMessage";

interface NoCraftingResultConfig {

    detail: string

}

class NoCraftingResult implements CraftingResult {

    private readonly _detail: string;

    constructor(config: NoCraftingResultConfig) {
        this._detail = config.detail;
    }

    get created(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    describe(): CraftingChatMessage {
        return new CraftingChatMessage({
            title: "Crafting not attempted",
            description: this._detail,
            iconType: IconType.FAILURE
        });
    }

}

export { NoCraftingResult }