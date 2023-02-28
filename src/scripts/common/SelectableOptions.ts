import {Identifiable, Serializable} from "./Identity";

class SelectableOptions<J, T extends Identifiable & Serializable<J>> implements Serializable<Record<string, J>> {

    private _options: Map<string, T>;
    private _selectedOptionId?: string;

    constructor({
        options = [],
        selectedOptionId
    }: {
        options?: T[],
        selectedOptionId?: string
    }) {
        this._options = this.prepareOptions(options);
        this._selectedOptionId = selectedOptionId;
        if (this._selectedOptionId) {
            this.validateSelection(this._selectedOptionId, this._options);
        }
    }

    private prepareOptions(options: T[]): Map<string, T> {
        if (!options || options.length === 0) {
            return new Map();
        }
        const result = new Map();
        for (const option of options) {
            if (result.has(option.id)) {
                throw new Error(`${option.id} is not a unique option name. `);
            }
            result.set(option.id, option);
        }
        return result;
    }

    public select(name: string) {
        this.validateSelection(name, this._options);
        this._selectedOptionId = name;
    }

    public deselect() {
        this._selectedOptionId = "";
    }

    private validateSelection(selection: string, options: Map<string, T>) {
        if (!options.has(selection)) {
            throw new Error(`${selection} is not a valid ingredient option. Available options are: ${Array.from(options.keys()).join(", ")}. `);
        }
    }

    get optionsByName(): Map<string, T> {
        return new Map(this._options);
    }

    get options(): T[] {
        return Array.from(this._options.values());
    }

    set options(values: T[]) {
        this._options = new Map(values.map(value => [value.id, value]));
    }

    get selectedOptionId(): string {
        return this._selectedOptionId;
    }

    get selectedOption(): T {
        if (this._options.size === 1) {
            return Array.from(this._options.values())[0];
        }
        return this._options.get(this._selectedOptionId);
    }

    get isEmpty(): boolean {
        return this._options.size === 0;
    }

    get requiresUserChoice(): boolean {
        return this._options.size > 1;
    }

    get isReady(): boolean {
        if (!this.requiresUserChoice) {
            return true;
        }
        return !!this._selectedOptionId;
    }

    toJson(): Record<string, J> {
        return Array.from(this._options.values())
            .reduce((previousValue, currentValue) => {
                previousValue[currentValue.id] = currentValue.toJson();
                return previousValue;
            }, <Record<string, J>>{});
    }

    add(value: T) {
        if (!value.id) {
            throw new Error("ID must not be null. ");
        }
        this._options.set(value.id, value);
    }

    has(id: string) {
        return this._options.has(id);
    }

    set(value: T) {
        this._options.set(value.id, value);
    }

    deleteById(id: string) {
        this._options.delete(id);
        if (this._selectedOptionId === id) {
            this.clearSelection()
        }
    }

    getById(id: string) {
        this._options.get(id);
    }

    private clearSelection() {
        this._selectedOptionId = null;
    }

    clone(): SelectableOptions<J, T> {
        return new SelectableOptions<J, T>({
            options: Array.from(this._options.values())
        })
    }
}

export { SelectableOptions }