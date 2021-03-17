class CraftingError extends Error {

    private readonly _componentsConsumed: boolean;

    constructor(message: string, componentsConsumed: boolean) {
        super(message);
        this._componentsConsumed = componentsConsumed;
    }

    get componentsConsumed(): boolean {
        return this._componentsConsumed;
    }

}

export {CraftingError}