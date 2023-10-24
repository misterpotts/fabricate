interface CraftingPlan {

    readonly isReady: boolean;

    readonly recipeName: string;

}

export { CraftingPlan };

class DefaultCraftingPlan implements CraftingPlan {

    private readonly _recipeName: string;

    constructor({
        recipeName,
    }: {
        recipeName: string;
    }) {
        this._recipeName = recipeName;
    }

    get recipeName(): string {
        return this._recipeName;
    }

    get isReady(): boolean {
        return true;
    }

}

export { DefaultCraftingPlan };

class NoCraftingPlan implements CraftingPlan {

    get recipeName(): string {
        return "No Recipe";
    }

    get isReady(): boolean {
        return false;
    }

}

export { NoCraftingPlan };