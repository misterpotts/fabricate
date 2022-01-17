class ValidationFailures {
  private readonly _propertyValidationFailures: Map<string, string[]> = new Map();

  constructor() {}

  public recordError(propertyName: string, errorDescription: string): boolean {
    if (this._propertyValidationFailures.has(propertyName)) {
      (<string[]>this._propertyValidationFailures.get(propertyName)).push(errorDescription);
      return true;
    }
    this._propertyValidationFailures.set(propertyName, [errorDescription]);
    return true;
  }

  get propertyValidationFailures(): Map<string, string[]> {
    return new Map(this._propertyValidationFailures);
  }

  get isEmpty(): boolean {
    return this._propertyValidationFailures.size === 0;
  }

  public toString(): string {
    if (this._propertyValidationFailures.size === 0) {
      return 'No validation errors. ';
    }
    const errorDescriptions: string[] = [];
    this._propertyValidationFailures.forEach((value, key) => errorDescriptions.push(`[${key}]: ${value}`));
    return errorDescriptions.join('\n');
  }
}

export { ValidationFailures };
