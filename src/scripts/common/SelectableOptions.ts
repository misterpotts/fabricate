import {Option} from "./Options";

interface SelectableOptions<T> {

    /**
     * Indicates whether the option with the given id exists.
     *
     * @param optionId - The id of the option to check.
     * @returns A boolean indicating whether the option with the given id exists.
     */
    has(optionId: string): boolean;

    /**
     * Selects the option with the given id.
     *
     * @param optionId - The id of the option to select.
     * @returns The selected option.
     * @throws Error if the option with the given id does not exist.
     */
    select(optionId: string): Option<T>;

    /**
     * Gets the selected option.
     *
     * @returns The selected option.
     * @throws Error if no option is selected.
     */
    selected: Option<T>;

    /**
     * Gets the id of the selected option.
     *
     * @returns The id of the selected option or an empty string if no option is selected.
     */
    selectedId: string;

    /**
     * Selects the next option in the set of options.
     *
     * @returns The next option in the set of options.
     * @throws Error if there are no options to select.
     */
    selectNext(): Option<T>;

    /**
     * Selects the previous option in the set of options.
     *
     * @returns The previous option in the set of options.
     * @throws Error if there are no options to select.
     */
    selectPrevious(): Option<T>;

    /**
     * Selects the first option in the set of options.
     *
     * @returns The first option in the set of options.
     * @throws Error if there are no options to select.
     */
    selectFirst(): Option<T>;

    /**
     * Selects the last option in the set of options.
     *
     * @returns The last option in the set of options.
     * @throws Error if there are no options to select.
     */
    selectLast(): Option<T>;

    /**
     * Gets all options in the set of options.
     *
     * @returns All options in the set of options. May be empty.
     */
    all(): Option<T>[];

    /**
     * The number of options in the set of options.
     */
    size: number;

    /**
     * Indicates whether the set of options is empty. This is equivalent to checking whether the size of the set of
     * options is 0.
     */
    isEmpty: boolean;

    /**
     * Indicates whether the set of options has a selected option.
     */
    isSelectionMade: boolean;

}

export {SelectableOptions}

class DefaultSelectableOptions<T> implements SelectableOptions<T> {

    private readonly _optionsById: Map<string, Option<T>>;
    private readonly _optionsInOrder: Option<T>[];
    private _selectedOptionId: string;

    constructor({
        options = [],
        selectedOptionId = ""
    }: {
        options?: Option<T>[];
        selectedOptionId?: string;
    } = {}) {
        this._optionsById = new Map();
        for (const option of options) {
            this._optionsById.set(option.id, option);
        }
        this._optionsInOrder = options;
        this._selectedOptionId = selectedOptionId;
        if (this._selectedOptionId === "" && !this.isEmpty) {
            this.selectFirst();
        }
    }

    get size(): number {
        return this._optionsInOrder.length;
    }

    get isEmpty(): boolean {
        return this.size === 0;
    }

    get selected(): Option<T> {
        if (this._selectedOptionId === "") {
            throw new Error("No option is selected. ");
        }
        return this._optionsById.get(this._selectedOptionId);
    }

    get selectedId(): string {
        return this._selectedOptionId;
    }

    has(optionId: string): boolean {
        return this._optionsById.has(optionId);
    }

    select(optionId: string): Option<T> {
        if (!this.has(optionId)) {
            throw new Error(`Cannot select option with id "${optionId}" because it does not exist. `);
        }
        this._selectedOptionId = optionId;
        return this.selected;
    }

    selectNext(): Option<T> {
        if (this.isEmpty) {
            throw new Error("Cannot select next entry in an empty set of options. ");
        }
        const next = this.findNext();
        this._selectedOptionId = next.id;
        return next;
    }

    selectPrevious(): Option<T> {
        if (this.isEmpty) {
            throw new Error("Cannot select previous entry in an empty set of options. ");
        }
        const previous = this.findPrevious();
        this._selectedOptionId = previous.id;
        return previous;
    }

    selectFirst(): Option<T> {
        if (this.isEmpty) {
            throw new Error("Cannot select first entry in an empty set of options. ");
        }
        this._selectedOptionId = this._optionsInOrder[0].id;
        return this.selected;
    }

    selectLast(): Option<T> {
        if (this.isEmpty) {
            throw new Error("Cannot select last entry in an empty set of options. ");
        }
        this._selectedOptionId = this._optionsInOrder[this._optionsInOrder.length - 1].id;
        return this.selected;
    }

    all(): Option<T>[] {
        return this._optionsInOrder;
    }

    private findPrevious(): Option<T> {
        const currentIndex = this.findCurrentIndex();
        if (currentIndex === 0) {
            return this._optionsInOrder[this._optionsInOrder.length - 1];
        }
        return this._optionsInOrder[currentIndex - 1];
    }

    private findNext(): Option<T> {
        const currentIndex = this.findCurrentIndex();
        if (currentIndex === this._optionsInOrder.length - 1) {
            return this._optionsInOrder[0];
        }
        return this._optionsInOrder[currentIndex + 1];
    }

    private findCurrentIndex() {
        const currentIndex = this._optionsInOrder.findIndex((option) => option.id === this._selectedOptionId);
        if (currentIndex === -1) {
            throw new Error(`Cannot find current selected option with id "${this._selectedOptionId}". `);
        }
        return currentIndex;
    }

    get isSelectionMade(): boolean {
        return this._selectedOptionId !== "";
    }

}

export { DefaultSelectableOptions }