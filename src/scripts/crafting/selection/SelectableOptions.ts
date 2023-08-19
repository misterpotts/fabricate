import {Identifiable} from "../../common/Identifiable";
import {Serializable} from "../../common/Serializable";

class SelectableOptions<J, T extends Identifiable & Serializable<J>> implements Serializable<Record<string, J>> {

    private _options: Map<string, T>;
    private _selectedOptionId?: string;

    constructor({
        options = [],
        selectedOptionId = ""
    }: {
        options?: T[],
        selectedOptionId?: string
    } = {}) {
        this._options = this.prepareOptions(options);
        this._selectedOptionId = selectedOptionId;
        if (this._selectedOptionId) {
            this.validateSelection(this._selectedOptionId, this._options);
        } else {
            this.selectFirst();
        }
    }

    public static EMPTY<J, T extends Identifiable & Serializable<J>>(): SelectableOptions<J, T> {
        return new SelectableOptions<J, T>();
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

    get byId(): Map<string, T> {
        return new Map(this._options);
    }

    get all(): T[] {
        return Array.from(this._options.values());
    }

    set options(values: T[]) {
        this._options = new Map(values.map(value => [value.id, value]));
    }

    get selectedOptionId(): string {
        return this._selectedOptionId;
    }

    get selectedOption(): T {
        if (this.isEmpty) {
            throw new Error("Cannot get selected option from an empty set of options. ");
        }
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
        return Array.from(this._options.values()).reduce((result, option) => {
            result[option.id] = option.toJson();
            return result;
        }, <Record<string, J>>{});
    }

    has(id: string) {
        return this._options.has(id);
    }

    set(value: T) {
        if (!value.id) {
            throw new Error("Option ID must be anon-empty string. ");
        }
        this._options.set(value.id, value);
    }

    deleteById(id: string) {
        this._options.delete(id);
        if (this._selectedOptionId === id) {
            this.clearSelection()
        }
    }

    getById(id: string) {
        return this._options.get(id);
    }

    private clearSelection() {
        this._selectedOptionId = null;
    }

    clone(mappingFunction?: (option: T) => T): SelectableOptions<J, T> {
        if (mappingFunction) {
            return new SelectableOptions<J, T>({
                options: Array.from(this._options.values()).map(mappingFunction)
            });
        }
        return new SelectableOptions<J, T>({
            options: Array.from(this._options.values())
        })
    }

    get size(): number {
        return this._options.size;
    }

    private indexSelection() {
        const values = Array.from(this._options.values());
        const selected = values
            .map((value, index) => {
                return { value, index };
            })
            .find(entry => entry.value.id === this._selectedOptionId);
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        return {
            values,
            isSingleton: values.length === 1,
            selected,
            isFirst: selected.index === 0,
            isLast: selected.index === values.length - 1,
            firstValue,
            lastValue
        }
    }

    private findPrevious(): T {
        const index = this.indexSelection();
        if (index.isSingleton) {
            return index.selected.value;
        }
        if (index.isFirst) {
            return index.lastValue;
        }
        return index.values[index.selected.index - 1];
    }

    private findNext(): T {
        const index = this.indexSelection();
        if (index.isSingleton) {
            return index.selected.value;
        }
        if (index.isLast) {
            return index.firstValue;
        }
        return index.values[index.selected.index + 1];
    }

    public selectPrevious() {
        if (this.isEmpty) {
            throw new Error("Cannot select previous entry in an empty set of options. ");
        }
        const previous = this.findPrevious();
        this._selectedOptionId = previous.id;
    }

    public selectNext() {
        if (this.isEmpty) {
            throw new Error("Cannot select next entry in an empty set of options. ");
        }
        const next = this.findNext();
        this._selectedOptionId = next.id;
    }

    equals(other: SelectableOptions<J, T>) {
        if (!other) {
            return false;
        }
        if (this.size !== other.size) {
            return false;
        }
        return Array.from(this._options.values())
            .map(thisOption => other.has(thisOption.id))
            .reduce((left, right) => left && right, true);
    }

    selectFirst() {
        if (this._options.size === 0) {
            this._selectedOptionId = "";
            return;
        }
        this._selectedOptionId = Array.from(this._options.values())[0].id;
    }

    nextId(): string {
        let generationAttempts = 1;
        let nextId;
        do {
            nextId = `option-${this._options.size + generationAttempts}`;
            generationAttempts++;
        } while (this._options.has(nextId));
        return nextId;
    }

    static fromJson<J, T extends Identifiable & Serializable<J>>(optionsJson: Record<string, J>, optionFactoryFunction: (json: J) => T) {
        const options = Object.values(optionsJson).map(optionJson => optionFactoryFunction(optionJson));
        return new SelectableOptions<J, T>({options});
    }
}

export { SelectableOptions }