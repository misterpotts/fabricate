import {Combination} from "../../common/Combination";
import {Component} from "../component/Component";

interface SalvageResult {

    readonly component: Component;
    readonly targetActorId: string;
    readonly sourceActorId: string;
    readonly description: string;
    readonly consumed: Component | undefined;
    readonly produced: Combination<Component>;
    readonly isSuccessful: boolean;

}

export { SalvageResult }

class NoSalvageResult implements SalvageResult {

    private readonly _component: Component;
    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _targetActorId: string;

    constructor({
        component,
        description,
        sourceActorId,
        targetActorId,
    }: {
        component: Component;
        description: string;
        sourceActorId: string;
        targetActorId: string;
    }) {
        this._component = component;
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._targetActorId = targetActorId;
    }

    get component(): Component {
        return this._component;
    }

    get produced(): Combination<Component> {
        return Combination.EMPTY();
    }

    get consumed(): Component {
        return undefined
    }

    get isSuccessful(): boolean {
        return false;
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

export { NoSalvageResult };

class SuccessfulSalvageResult implements SalvageResult {

    private readonly _component: Component;
    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _targetActorId: string;
    private readonly _consumed: Component;
    private readonly _produced: Combination<Component>;

    constructor({
        component,
        description,
        sourceActorId,
        targetActorId,
        consumed,
        produced,
    }: {
        component: Component;
        description: string;
        sourceActorId: string;
        targetActorId: string;
        consumed: Component;
        produced: Combination<Component>;
    }) {
        this._component = component;
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._targetActorId = targetActorId;
        this._consumed = consumed;
        this._produced = produced;
    }

    get component(): Component {
        return this._component;
    }

    get consumed(): Component {
        return this._consumed;
    }

    get produced(): Combination<Component> {
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

    private readonly _component: Component;
    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _consumed: Component;

    constructor({
        component,
        description,
        sourceActorId,
        consumed
    }: {
        component: Component;
        description: string;
        sourceActorId: string;
        consumed: Component;
    }) {
        this._component = component;
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._consumed = consumed;
    }


    get component(): Component {
        return this._component;
    }

    get produced(): Combination<Component> {
        return Combination.EMPTY();
    }

    get consumed(): Component {
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