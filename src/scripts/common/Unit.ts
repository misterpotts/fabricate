import {Identifiable} from "./Identifiable";

/**
 * Represents a single unit with an associated quantity of an Identifiable object.
 * The unit quantity can be manipulated without altering the original object. Units are immutable.
 *
 * @template T - A type that extends the Identifiable interface.
 */
interface Unit<T extends Identifiable> {

    /**
     * @returns {T} The Identifiable element of the unit.
     */
    readonly element: T;

    /**
     * @returns {number} The quantity of the unit.
     */
    readonly quantity: number;

    /**
     * Adds a specified amount to the current quantity of the unit by creating a new Unit instance without altering the
     *  original.
     *
     * @param {number} amount - The amount to add to the current quantity.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    add(amount: number): Unit<T>;

    /**
     * Subtracts a specified amount from the current quantity of the unit by creating a new Unit instance without
     *  altering the original. Optionally applies a floor to the resulting quantity.
     *
     * @param {number} amount - The amount to subtract from the current quantity.
     * @param {number} [floor] - Optional floor to apply to the resulting quantity.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    minus(amount: number, floor?: number): Unit<T>;

    /**
     * Inverts the quantity of the unit (multiplies the quantity by -1) by creating a new Unit instance without altering
     *  the original
     *
     * @returns {Unit<T>} A new Unit instance with the inverted quantity.
     */
    invert(): Unit<T>;

    /**
     * Creates a new Unit instance with the same identifiable object and the specified quantity without altering the
     *  original
     *
     * @param {number} amount - The quantity to set for the new Unit instance.
     * @returns {Unit<T>} A new Unit instance with the specified quantity.
     */
    withQuantity(amount: number): Unit<T>;

    /**
     * Multiplies the unit quantity by a specified factor by creating a new Unit instance without altering the original
     *
     * @param {number} factor - The multiplication factor.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    multiply(factor: number): Unit<T>;

    /**
     * Combines the current Unit with another Unit of the same type by creating a new Unit instance without altering the
     * original. The resulting Unit will have a quantity equal to the sum of both unit quantities.
     *
     * @param {Unit<T>} other - The other Unit to combine with the current Unit.
     * @returns {Unit<T>} A new Unit instance with the combined quantities.
     */
    combineWith(other: Unit<T>): Unit<T>;

    /**
     * Creates a new Unit instance with the same identifiable object and quantity.
     */
    clone(): Unit<T>;

}

export { Unit }

class DefaultUnit<T extends Identifiable> implements Unit<T> {

    private readonly _element: T;
    private readonly _quantity: number;

    /**
     * Creates a new DefaultUnit instance with the provided member and quantity.
     *
     * @param {T} member - The Identifiable object of the unit.
     * @param {number} quantity - The quantity of the unit.
     */
    constructor(member: T, quantity: number) {
        this._element = member;
        this._quantity = quantity;
    }

    get element(): T {
        return this._element;
    }

    get quantity(): number {
        return this._quantity;
    }

    add(amount: number): Unit<T> {
        return new DefaultUnit<T>(this._element, this._quantity + amount);
    }

    minus(amount: number, floor?: number): Unit<T> {
        const targetQuantity = this._quantity - amount;
        if ((typeof floor !== "undefined") && floor > targetQuantity) {
            return new DefaultUnit<T>(this._element, floor);
        }
        return new DefaultUnit<T>(this._element, targetQuantity);
    }

    invert(): Unit<T> {
        return new DefaultUnit<T>(this._element, this._quantity * -1);
    }

    withQuantity(amount: number): Unit<T> {
        return new DefaultUnit<T>(this._element, amount);
    }

    multiply(factor: number): Unit<T> {
        return new DefaultUnit<T>(this._element, this._quantity * factor);
    }

    combineWith(other: Unit<T>): Unit<T> {
        return this.add(other.quantity);
    }

    clone() {
        return new DefaultUnit<T>(this._element, this._quantity);
    }

}

export { DefaultUnit }