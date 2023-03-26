interface EntityValidationResult<T> {

    readonly entity: T;

    readonly isSuccessful: boolean;

    readonly errors: string[];

}

export { EntityValidationResult };

class DefaultEntityValidationResult<T> implements EntityValidationResult<T> {

    private readonly _entity: T;
    private readonly _errors: string[];
    private readonly _isSuccessful: boolean;

    constructor({entity, errors = [], isSuccessful}: { entity: T, errors?: string[], isSuccessful?: boolean }) {
        this._entity = entity;
        this._errors = errors;
        this._isSuccessful = typeof isSuccessful !== "undefined" ? isSuccessful : errors.length === 0;
    }

    get entity(): T {
        return this._entity;
    }

    get errors(): string[] {
        return this._errors;
    }

    get isSuccessful(): boolean {
        return this._isSuccessful;
    }

}

export { DefaultEntityValidationResult };

interface EntityValidator<T> {

    validate(candidate: T): Promise<EntityValidationResult<T>>;

}

export { EntityValidator };

