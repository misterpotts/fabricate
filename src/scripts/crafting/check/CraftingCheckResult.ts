interface CraftingCheckResult {

    isSuccessful: boolean;
    expression: string;
    result: number;
    successThreshold: number;

    describe(): string;

}

export {CraftingCheckResult};