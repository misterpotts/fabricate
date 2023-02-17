import {Identifiable, Serializable} from "./Identity";

class SelectableOptions<J, T extends Identifiable & Serializable<J>> implements Serializable<Record<string, J>> {

    private readonly _options: Map<string, T>;
    private _selectedOptionId?: string;

    constructor({
        options = [],
        selectedOptionId
    }: {
        options?: T[],
        selectedOptionId?: string
    }) {
        this._options = new Map(options.map(value => [value.id, value]));
        this._selectedOptionId = selectedOptionId;
        if (this._selectedOptionId) {
            this.validateSelection(this._selectedOptionId, this._options);
        }
    }

    public select(name: string) {
        this.validateSelection(name, this._options);
        this._selectedOptionId = name;
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
        return Array.from(this.options.values());
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
        return Array.from(this._options.entries())
            .map(element => {
                return { key: element[0], value: element[1] }
            })
            .reduce((previousValue, currentValue) => {
                previousValue[currentValue.key] = currentValue.value.toJson();
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

    private clearSelection() {
        this._selectedOptionId = null;
    }

}

export { SelectableOptions }