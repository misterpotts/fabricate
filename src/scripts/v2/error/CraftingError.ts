class CraftingError extends Error {

    private readonly _isWastage: boolean;

    constructor(message: string, wastage: boolean) {
        super(message);
        this._isWastage = wastage;
    }

    get isWastage(): boolean {
        return this._isWastage;
    }

}

export {CraftingError}