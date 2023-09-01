import {Combination} from "../../common/Combination";
import {ComponentReference} from "../component/ComponentReference";

interface SalvageResult {

    readonly targetActorId: string;
    readonly sourceActorId: string;
    readonly description: string;
    consumed: ComponentReference;
    produced: Combination<ComponentReference>;
    isSuccessful: boolean;

}

export { SalvageResult }

class NoSalvageResult implements SalvageResult {

    private readonly _description: string;

    constructor(description: string) {
        this._description = description;
    }

    get produced(): Combination<ComponentReference> {
        return Combination.EMPTY();
    }

    get consumed(): ComponentReference {
        return ComponentReference.NONE();
    }

    get isSuccessful(): boolean {
        return false;
    }

    get targetActorId(): string {
        return "";
    }

    get sourceActorId(): string {
        return "";
    }

    get description(): string {
        return this._description;
    }

}

export {NoSalvageResult};

class SuccessfulSalvageResult implements SalvageResult {

    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _targetActorId: string;
    private readonly _consumed: ComponentReference;
    private readonly _produced: Combination<ComponentReference>;

    constructor({
        description,
        sourceActorId,
        targetActorId,
        consumed,
        produced,
    }: {
        description: string;
        sourceActorId: string;
        targetActorId: string;
        consumed: ComponentReference;
        produced: Combination<ComponentReference>;
    }) {
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._targetActorId = targetActorId;
        this._consumed = consumed;
        this._produced = produced;
    }

    get consumed(): ComponentReference {
        return this._consumed;
    }

    get produced(): Combination<ComponentReference> {
        return this._produced;
    }

    get isSuccessful(): boolean {
        return true;
    }

    get targetActorId(): string {
        return this._targetActorId;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get description(): string {
        return this._description;
    }

}

export { SuccessfulSalvageResult };

class UnsuccessfulSalvageResult implements SalvageResult {

    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _consumed: ComponentReference;

    constructor({
        description,
        sourceActorId,
        consumed
    }: {
        description: string;
        sourceActorId: string;
        consumed: ComponentReference;
    }) {
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._consumed = consumed;
    }

    get produced(): Combination<ComponentReference> {
        return Combination.EMPTY();
    }

    get consumed(): ComponentReference {
        return this._consumed;
    }

    get isSuccessful(): boolean {
        return false;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get targetActorId(): string {
        return "";
    }

    get description(): string {
        return this._description;
    }

}

export { UnsuccessfulSalvageResult };