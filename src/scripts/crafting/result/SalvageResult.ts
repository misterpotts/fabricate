import {Combination} from "../../common/Combination";
import {Component} from "../../common/Component";

interface SalvageResult {

    consumed: Combination<Component>;
    created: Combination<Component>;
    isSuccessful: boolean;

}

export { SalvageResult }

class NoSalvageResult implements SalvageResult {

    constructor() {}

    get created(): Combination<Component> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<Component> {
        return Combination.EMPTY();
    }

    get isSuccessful(): boolean {
        return false;
    }

}

export {NoSalvageResult};

class SuccessfulSalvageResult implements SalvageResult {

    private readonly _consumed: Combination<Component>;
    private readonly _created: Combination<Component>;

    constructor({
        consumed,
        created
    }: {
        consumed: Combination<Component>;
        created: Combination<Component>;
    }) {
        this._consumed = consumed;
        this._created = created;
    }

    get consumed(): Combination<Component> {
        return this._consumed;
    }

    get created(): Combination<Component> {
        return this._created;
    }

    get isSuccessful(): boolean {
        return true;
    }

}

export { SuccessfulSalvageResult };

class UnsuccessfulSalvageResult implements SalvageResult {

    private readonly _consumed: Combination<Component>;

    constructor({
        consumed
    }: {
        consumed: Combination<Component>;
    }) {
        this._consumed = consumed;
    }

    get created(): Combination<Component> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<Component> {
        return this._consumed;
    }

    get isSuccessful(): boolean {
        return false;
    }

}

export { UnsuccessfulSalvageResult };