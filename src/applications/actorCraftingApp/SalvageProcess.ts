import {Combination, DefaultCombination} from "../../scripts/common/Combination";
import {Component} from "../../scripts/crafting/component/Component";
import {SelectableOptions} from "../../scripts/common/SelectableOptions";
import {TrackedCombination} from "../../scripts/common/TrackedCombination";

interface SalvageOption {

    products: Combination<Component>;

    catalysts: TrackedCombination<Component>;

    name: string;

    id: string;

    requiresCatalysts: boolean;

}

export { SalvageOption };

class DefaultSalvageOption implements SalvageOption {

    readonly _id: string;
    private readonly _name: string;
    private readonly _products: Combination<Component>;
    private readonly _catalysts: TrackedCombination<Component>;

    constructor({
        id,
        name,
        products = DefaultCombination.EMPTY(),
        catalysts = TrackedCombination.EMPTY(),
    }: {
        id: string;
        name: string;
        products?: Combination<Component>;
        catalysts?: TrackedCombination<Component>;
    }) {
        this._id = id;
        this._name = name;
        this._products = products;
        this._catalysts = catalysts;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get products(): Combination<Component> {
        return this._products;
    }

    get catalysts(): TrackedCombination<Component> {
        return this._catalysts;
    }

    get requiresCatalysts(): boolean {
        return !this._catalysts.isEmpty;
    }

}

export { DefaultSalvageOption };

interface SalvageProcess {

    readonly componentName: string;

    readonly isReady: boolean;

    selectNextOption(): SalvageOption;

    selectPreviousOption(): SalvageOption;

    selectedOption: SalvageOption;

    hasOptions: boolean;

    canStart: boolean;

}

export { SalvageProcess };

class DefaultSalvageProcess implements SalvageProcess {

    private readonly _componentName: string;
    private readonly _options: SelectableOptions<SalvageOption>;

    constructor({
        options,
        componentName,
    }: {
        options: SelectableOptions<SalvageOption>;
        componentName: string;
    }) {
        this._options = options;
        this._componentName = componentName;
    }

    get canStart(): boolean {
        if (!this._options.selected.value.requiresCatalysts) {
            return true;
        }
        return !this._options.selected.value.catalysts.isSufficient;
    }

    get componentName() {
        return this._componentName;
    }

    selectNextOption(): SalvageOption {
        return this._options.selectNext().value;
    }

    selectPreviousOption(): SalvageOption {
        return this._options.selectPrevious().value;
    }

    get selectedOption(): SalvageOption {
        return this._options.selected.value;
    }

    get hasOptions(): boolean {
        return this._options.size > 1;
    }

    get isReady(): boolean {
        return true;
    }

}

export { DefaultSalvageProcess };

class NoSalvageProcess implements SalvageProcess {

    get canStart(): boolean {
        return false;
    }

    selectNextOption(): SalvageOption {
        throw new Error("No options are available. ");
    }

    selectPreviousOption(): SalvageOption {
        throw new Error("No options are available. ");
    }

    get selectedOption(): SalvageOption {
        throw new Error("No options are available. ");
    }

    get componentName() {
        return "No Component Selected";
    }

    get hasOptions(): boolean {
        return false;
    }

    get isReady(): boolean {
        return false;
    }

}

export { NoSalvageProcess };