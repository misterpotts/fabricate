class CraftingError extends Error {
  private readonly _causesWastage: boolean;

  constructor(message: string, wastage: boolean) {
    super(message);
    this._causesWastage = wastage;
  }

  get causesWastage(): boolean {
    return this._causesWastage;
  }
}

export { CraftingError };
