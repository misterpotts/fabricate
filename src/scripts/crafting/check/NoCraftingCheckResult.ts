import {CraftingCheckResult} from "./CraftingCheckResult";

class NoCraftingCheckResult implements CraftingCheckResult {

    constructor() {}

    get isSuccessful(): boolean {
        return true;
    }

    get expression(): string {
        return '';
    }

    get result(): number {
        return 0;
    }

    get successThreshold(): number {
        return 0;
    }

    describe(): string {
        return `The crafting check was not attempted. `;
    }

}

export {NoCraftingCheckResult};