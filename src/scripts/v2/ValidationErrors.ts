class ValidationErrors {

    private readonly _propertyValidationErrors: Map<string, string[]> = new Map();

    constructor() {}

    public recordError(propertyName: string, errorDescription: string): boolean {
        if (this._propertyValidationErrors.has(propertyName)) {
            this._propertyValidationErrors.get(propertyName).push(errorDescription);
            return true;
        }
        this._propertyValidationErrors.set(propertyName, [errorDescription]);
        return true;
    }

    get propertyValidationErrors(): Map<string, string[]> {
        return new Map(this._propertyValidationErrors);
    }

    get isEmpty(): boolean {
        return this._propertyValidationErrors.size === 0;
    }

    public toString(): string {
        if (this._propertyValidationErrors.size === 0) {
            return 'No validation errors. '
        }
        const errorDescriptions: string[] = [];
        this._propertyValidationErrors.forEach((value, key) => errorDescriptions.push(`[${key}]: ${value}`));
        return errorDescriptions.join('\n');
    }

}

export {ValidationErrors}