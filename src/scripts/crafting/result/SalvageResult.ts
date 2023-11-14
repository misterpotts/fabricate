import {Combination, DefaultCombination} from "../../common/Combination";
import {Component} from "../component/Component";

interface SalvageResult {

    readonly component: Component;
    readonly targetActorId: string;
    readonly sourceActorId: string;
    readonly description: string;
    readonly consumed: Combination<Component>;
    readonly produced: Combination<Component>;
    readonly remaining: Combination<Component>;
    readonly isSuccessful: boolean;

}

export { SalvageResult }

class NoSalvageResult implements SalvageResult {

    private readonly _component: Component;
    private readonly _remaining: Combination<Component>;
    private readonly _description: string;
    private readonly _sourceActorId: string;
    private readonly _targetActorId: string;

    constructor({
        component,
        remaining = DefaultCombination.EMPTY(),
        description,
        sourceActorId,
        targetActorId,
    }: {
        component: Component;
        remaining?: Combination<Component>;
        description: string;
        sourceActorId: string;
        targetActorId: string;
    }) {
        this._component = component;
        this._remaining = remaining;
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._targetActorId = targetActorId;
    }

    get remaining(): Combination<Component> {
        return this._remaining;
    }

    get component(): Component {
        return this._component;
    }

    get produced(): Combination<Component> {
        return DefaultCombination.EMPTY();
    }

    get consumed(): Combination<Component> {
        return DefaultCombination.EMPTY();
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
    private readonly _consumed: Combination<Component>;
    private readonly _produced: Combination<Component>;
    private readonly _remaining: Combination<Component>;

    constructor({
        component,
        description,
        sourceActorId,
        targetActorId,
        consumed,
        produced,
        remaining,
    }: {
        component: Component;
        description: string;
        sourceActorId: string;
        targetActorId: string;
        consumed: Combination<Component>;
        produced: Combination<Component>;
        remaining: Combination<Component>;
    }) {
        this._component = component;
        this._description = description;
        this._sourceActorId = sourceActorId;
        this._targetActorId = targetActorId;
        this._consumed = consumed;
        this._produced = produced;
        this._remaining = remaining;
    }

    get remaining(): Combination<Component> {
        return this._remaining;
    }

    get component(): Component {
        return this._component;
    }

    get consumed(): Combination<Component> {
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
    private readonly _consumed: Combination<Component>;
    private readonly _remaining: Combination<Component>;
    private readonly _description: string;
    private readonly _sourceActorId: string;

    constructor({
        component,
        consumed = DefaultCombination.EMPTY(),
        remaining = DefaultCombination.EMPTY(),
        description,
        sourceActorId,
    }: {
        component: Component;
        consumed?: Combination<Component>;
        remaining?: Combination<Component>;
        description: string;
        sourceActorId: string;
    }) {
        this._consumed = consumed;
        this._remaining = remaining;
        this._component = component;
        this._description = description;
        this._sourceActorId = sourceActorId;

    }

    get remaining(): Combination<Component> {
        return this._remaining;
    }

    get component(): Component {
        return this._component;
    }

    get produced(): Combination<Component> {
        return DefaultCombination.EMPTY();
    }

    get consumed(): Combination<Component> {
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