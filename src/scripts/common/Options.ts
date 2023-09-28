import {Identifiable} from "./Identifiable";
import {Serializable} from "./Serializable";

interface OptionJson<T> {

    id: string;

    name: string;

    value: T;
}

interface OptionConfig<T> {

    id? : string;

    name : string;

    value : T;

}

export {OptionConfig}

/**
 * An option.
 */
interface Option<T> extends Identifiable {

    /**
     * The unique id of the option within the set of options.
     */
    id: string;

    /**
     * The display name of the option.
     */
    name: string;

    /**
     * The value (or contents) of the option.
     */
    value: T;

    /**
     * Clone the option.
     *
     * @param id - The id of the cloned option.
     * @returns Option<T> The cloned option.
     */
    clone(id: string): Option<T>;

    /**
     * Whether the option is equal to another option.
     *
     * @param other - The other option.
     * @returns boolean Whether the options are equal.
     */
    equals(other: Option<T>): boolean;

}

export {Option}

class DefaultOption<T> implements Option<T> {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _value: T;

    constructor({
        id,
        name,
        value
    }: {
        id: string;
        name: string;
        value: T;
    }) {
        this._id = id;
        this._name = name;
        this._value = value;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get value(): T {
        return this._value;
    }

    clone(id: string): Option<T> {
        return new DefaultOption<T>({
            id,
            name: this._name,
            value: this._value
        });
    }

    equals(other: Option<T>): boolean {
        // Cannot compare on value as the type T may not be comparable
        return this._id === other.id
            && this._name === other.name;
    }

}

export {DefaultOption}

interface SerializableOption<J, T extends Serializable<J>> extends Option<T>, Serializable<OptionJson<J>> {

    toJson(): OptionJson<J>;

    clone(id: string): SerializableOption<J, T>;

}

export {SerializableOption}

class DefaultSerializableOption<J, T extends Serializable<J>> implements SerializableOption<J, T> {

    private readonly _option: Option<T>;

    constructor({
        id,
        name,
        value
    }: {
        id: string;
        name: string;
        value: T;
    }) {
        this._option = new DefaultOption<T>({
            id,
            name,
            value
        });
    }

    get id(): string {
        return this._option.id;
    }

    get name(): string {
        return this._option.name;
    }

    get value(): T {
        return this._option.value;
    }

    public toJson(): OptionJson<J> {
        return {
            id: this.id,
            name: this.name,
            value: this.value.toJson()
        };
    }

    clone(id: string): SerializableOption<J, T> {
        return new DefaultSerializableOption<J, T>({
            id,
            name: this._option.name,
            value: this._option.value
        });
    }

    equals(other: SerializableOption<J, T>): boolean {
        return this._option.equals(other);
    }

}

export {DefaultSerializableOption}

/**
 * A collection of options.
 */
interface Options<T> {

    /**
     * All options.
     */
    readonly all: Option<T>[];

    /**
     * The number of options.
     */
    readonly size: number;

    /**
     * Whether there are no options.
     */
    readonly isEmpty: boolean;

    /**
     * A map of options by id.
     */
    readonly byId: Map<string, Option<T>>;

    /**
     * Set an option. If the option has no ID one will be generated. If the option has an ID and an option with that ID
     * already exists it will be replaced.
     *
     * @param option - The option to set.
     */
    set(option: Option<T>): void;

    /**
     * Get an option by ID.
     *
     * @param id - The ID of the option.
     * @returns Option<T> The option or undefined if no option with the given ID exists.
     */
    get(id: string): Option<T>;

    /**
     * Remove an option.
     *
     * @param option - The id of the option to remove or the  option itself.
     */
    remove(option: string | Option<T>): void;

    /**
     * Whether an option exists.
     *
     * @param option - The id of the option to check or the option itself.
     */
    has(option: string | Option<T>): boolean;

    /**
     * Clone the options.
     */
    clone(): Options<T>;

    /**
     * Whether the options are equal to another set of options.
     *
     * @param other - The other options.
     * @returns boolean Whether the options are equal.
     */
    equals(other: Options<T>): boolean;

}

export {Options}

class DefaultOptions<T> implements Options<T> {

    private readonly _values: Map<string, Option<T>>;

    constructor(values: Option<T>[] = []) {
        this._values = new Map(values.map(option => [option.id, option]));
    }

    public static EMPTY<T>(): Options<T> {
        return new DefaultOptions<T>();
    }

    public set(option: Option<T>) {
        if (option.id) {
            this._values.set(option.id, option);
        }
        const id = this.nextId(Array.from(this._values.keys()));
        option = option.clone(id);
        this._values.set(id, option);
    }

    public get(id: string): Option<T> {
        return this._values.get(id);
    }

    public remove(option: string | Option<T>) {
        if (typeof option === "string") {
            this._values.delete(option);
        } else {
            this._values.delete(option.id);
        }
    }

    public has(option: string | Option<T>): boolean {
        if (typeof option === "string") {
            return this._values.has(option);
        }
        return this._values.has(option.id);
    }

    public clone(): Options<T> {
        return new DefaultOptions<T>(Array.from(this._values.values()));
    }

    get all(): Option<T>[] {
        return Array.from(this._values.values());
    }

    get size(): number {
        return this._values.size;
    }

    get isEmpty(): boolean {
        return this._values.size === 0;
    }

    get byId(): Map<string, Option<T>> {
        return new Map(this._values);
    }

    private nextId(assignedIds: string[]): string {
        let generationAttempts = 1;
        let value;
        do {
            value = `option-${this._values.size + generationAttempts}`;
            generationAttempts++;
        } while (assignedIds.includes(value));
        return value;
    }

    equals(other: Options<T>): boolean {
        if (this.size !== other.size) {
            return false;
        }
        for (const option of this.all) {
            if (!other.has(option)) {
                return false;
            }
        }
        return true;
    }

}

export {DefaultOptions}

interface SerializableOptions<J, T extends Serializable<J>> extends Options<T>, Serializable<Record<string, J>> {

    toJson(): Record<string, J>;

    clone(optionTransformFunction?: (value: T) => T): SerializableOptions<J, T>;

}

export {SerializableOptions}

class DefaultSerializableOptions<J, T extends Serializable<J>> implements SerializableOptions<J, T> {

    private readonly _options: Options<T>;

    constructor(values: Option<T>[] = []) {
        this._options = new DefaultOptions<T>(values);
    }

    get all(): Option<T>[] {
        return this._options.all;
    }

    get size(): number {
        return this._options.size;
    }

    get isEmpty(): boolean {
        return this._options.isEmpty;
    }

    get byId(): Map<string, Option<T>> {
        return this._options.byId;
    }

    public toJson(): Record<string, J> {
        return Array.from(this._options.byId.values())
                .reduce((result, option) => {
                result[option.id] = option.value.toJson()
                return result;
            }, <Record<string, J>>{});
    }

    public set(option: Option<T>): void {
        this._options.set(option);
    }

    public get(id: string): Option<T> {
        return this._options.get(id);
    }

    public remove(option: string | Option<T>): void {
        this._options.remove(option);
    }

    public has(option: string | Option<T>): boolean {
        return this._options.has(option);
    }

    public clone(optionTransformFunction?: (value: T) => T): SerializableOptions<J, T> {
        if (!optionTransformFunction) {
            return new DefaultSerializableOptions<J, T>(this._options.all);
        }
        const values = this._options.all.map(option => {
            return new DefaultSerializableOption<J, T>({
                id: option.id,
                name: option.name,
                value: optionTransformFunction(option.value)
            });
        });
        return new DefaultSerializableOptions<J, T>(values);
    }

    equals(other: SerializableOptions<J, T>): boolean {
        return this._options.equals(other);
    }

}

export {DefaultSerializableOptions}