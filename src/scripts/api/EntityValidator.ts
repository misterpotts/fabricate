import {Identifiable} from "../common/Identifiable";
import {Serializable} from "../common/Serializable";

interface EntityValidationResult<T> {

    readonly entity: T;

    readonly successful: boolean;

    readonly errors: string[];

}

export { EntityValidationResult };

class DefaultEntityValidationResult<T> implements EntityValidationResult<T> {

    private readonly _entity: T;
    private readonly _errors: string[];
    private readonly _successful: boolean;

    constructor({entity, errors = [], isSuccessful}: { entity: T, errors?: string[], isSuccessful?: boolean }) {
        this._entity = entity;
        this._errors = errors;
        this._successful = typeof isSuccessful !== "undefined" ? isSuccessful : errors.length === 0;
    }

    get entity(): T {
        return this._entity;
    }

    get errors(): string[] {
        return this._errors;
    }

    get successful(): boolean {
        return this._successful;
    }

}

export { DefaultEntityValidationResult };

interface EntityValidator<J, T extends Identifiable & Serializable<J>, A extends any[] = []> {

    validate(candidate: T, ...additionalArgs: A): Promise<EntityValidationResult<T>>;

    validateJson(candidate: J, ...additionalArgs: A): Promise<EntityValidationResult<J>>;

}

export { EntityValidator };

