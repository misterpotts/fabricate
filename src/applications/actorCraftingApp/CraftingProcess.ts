interface CraftingProcess {

    readonly isReady: boolean;

    readonly recipeName: string;

}

export { CraftingProcess };

class DefaultCraftingProcess implements CraftingProcess {

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

export { DefaultCraftingProcess };

class NoCraftingProcess implements CraftingProcess {

    get recipeName(): string {
        return "No Recipe";
    }

    get isReady(): boolean {
        return false;
    }

}

export { NoCraftingProcess };