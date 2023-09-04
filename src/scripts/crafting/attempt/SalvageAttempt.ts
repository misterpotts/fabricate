import {SelectableOptions} from "../selection/SelectableOptions";
import {SalvageOption, SalvageOptionJson} from "../component/SalvageOption";
import {NoSalvageResult, SalvageResult, SuccessfulSalvageResult} from "../result/SalvageResult";
import {ComponentReference} from "../component/ComponentReference";

interface SalvageAttempt {

    readonly targetActorId: string;
    readonly sourceActorId: string;
    readonly componentId: string;
    readonly description: string;
    readonly isPossible: boolean;
    readonly selectedSalvageOption: SalvageOption;
    readonly hasOptions: boolean;
    selectNextOption(): void;
    selectPreviousOption(): void;
    readonly options: SelectableOptions<SalvageOptionJson, SalvageOption>;
    perform(): SalvageResult;

}

export { SalvageAttempt }

class ImpossibleSalvageAttempt implements SalvageAttempt {
    
    private readonly _targetActorId: string;
    private readonly _sourceActorId: string;
    private readonly _componentId: string;
    private readonly _description: string;

    constructor({
        targetActorId,
        sourceActorId,
        componentId,
        description
    }: {
        targetActorId: string;
        sourceActorId: string;
        componentId: string
        description: string;
    }) {
        this._targetActorId = targetActorId;
        this._sourceActorId = sourceActorId;
        this._componentId = componentId;
        this._description = description;
    }

    get targetActorId(): string {
        return this._targetActorId;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get componentId(): string {
        return this._componentId;
    }

    get description(): string {
        return this._description;
    }
    
    get isPossible(): boolean {
        return false;
    }

    get hasOptions(): boolean {
        return false;
    }

    get selectedSalvageOption(): SalvageOption {
        throw new Error("Impossible salvage attempts have no salvage options. ");
    }

    selectNextOption(): void {}

    selectPreviousOption(): void {}

    get options(): SelectableOptions<SalvageOptionJson, SalvageOption> {
        return SelectableOptions.EMPTY();
    }

    perform(): SalvageResult {
        return new NoSalvageResult(this._description);
    }

}

export { ImpossibleSalvageAttempt }

class DefaultSalvageAttempt implements SalvageAttempt {

    private readonly _targetActorId: string;
    private readonly _sourceActorId: string;
    private readonly _componentId: string
    private readonly _description: string;

    // todo: rip selectableoptions out of recipe and component and move it all here, drop the serialisation stuff
    private readonly _options: SelectableOptions<SalvageOptionJson, SalvageOption>;

    constructor({
        targetActorId,
        sourceActorId,
        componentId,
        description,
        options,
    }: {
        targetActorId: string;
        sourceActorId: string;
        componentId: string
        description: string;
        options: SelectableOptions<SalvageOptionJson, SalvageOption>;
    }) {
        this._targetActorId = targetActorId;
        this._sourceActorId = sourceActorId;
        this._componentId = componentId;
        this._description = description;
        this._options = options;
    }

    get targetActorId(): string {
        return this._targetActorId;
    }

    get sourceActorId(): string {
        return this._sourceActorId;
    }

    get componentId(): string {
        return this._componentId;
    }

    get description(): string {
        return this._description;
    }
    
    get isPossible(): boolean {
        return true;
    }

    get selectedSalvageOption(): SalvageOption {
        return this._options.selectedOption;
    }

    get hasOptions(): boolean {
        return this._options.size > 1;
    }

    selectNextOption() {
        this._options.selectNext();
    }

    selectPreviousOption() {
        this._options.selectPrevious();
    }

    get options(): SelectableOptions<SalvageOptionJson, SalvageOption> {
        return this._options;
    }

    perform(): SalvageResult {
        return new SuccessfulSalvageResult({
            description: this._description,
            sourceActorId: this._sourceActorId,
            targetActorId: this._targetActorId,
            consumed: new ComponentReference(this._componentId),
            produced: this._options.selectedOption.results,
        });
    }

}

export { DefaultSalvageAttempt }