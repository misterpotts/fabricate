import {Combination, DefaultCombination} from "../../scripts/common/Combination";
import {Component} from "../../scripts/crafting/component/Component";
import {SelectableOptions} from "../../scripts/common/SelectableOptions";
import {TrackedCombination} from "../../scripts/common/TrackedCombination";
import Properties from "../../scripts/Properties";

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

    readonly componentImageUrl: string;

    readonly componentId: string;

    readonly ownedQuantity: number;

    readonly isReady: boolean;

    selectNextOption(): SalvageOption;

    selectPreviousOption(): SalvageOption;

    selectedOption: SalvageOption;

    hasOptions: boolean;

    canStart: boolean;

}

export { SalvageProcess };

class DefaultSalvageProcess implements SalvageProcess {

    private readonly _options: SelectableOptions<SalvageOption>;
    private readonly _ownedQuantity: number;
    private readonly _componentId: string;
    private readonly _componentName: string;
    private readonly _componentImageUrl: string;

    constructor({
        options,
        ownedQuantity,
        componentId,
        componentName,
        componentImageUrl,
    }: {
        options: SelectableOptions<SalvageOption>;
        ownedQuantity: number;
        componentId: string;
        componentName: string;
        componentImageUrl: string;
    }) {
        this._options = options;
        this._ownedQuantity = ownedQuantity;
        this._componentId = componentId;
        this._componentName = componentName;
        this._componentImageUrl = componentImageUrl;
    }

    get componentId(): string {
        return this._componentId;
    }

    get ownedQuantity(): number {
        return this._ownedQuantity;
    }

    get canStart(): boolean {
        if (!this._options.selected.value.requiresCatalysts) {
            return true;
        }
        return this._options.selected.value.catalysts.isSufficient;
    }

    get componentImageUrl() {
        return this._componentImageUrl;
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

    get ownedQuantity(): number {
        return 0;
    }

    get componentId(): string {
        return "NO_ID";
    }

    get canStart(): boolean {
        return false;
    }

    get componentImageUrl() {
        return Properties.ui.defaults.componentImageUrl;
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