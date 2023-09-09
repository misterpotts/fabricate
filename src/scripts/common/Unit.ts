import {Identifiable, Nothing} from "./Identifiable";

/**
 * Represents a single unit with an associated quantity of an Identifiable object.
 * The unit quantity can be manipulated without altering the original object. Units are immutable.
 *
 * @template T - A type that extends the Identifiable interface.
 */
class Unit<T extends Identifiable> {

    private readonly _element: T;
    private readonly _quantity: number;

    /**
     * Creates a new Unit instance with the provided member and quantity.
     *
     * @param {T} member - The Identifiable object of the unit.
     * @param {number} quantity - The quantity of the unit.
     */
    constructor(member: T, quantity: number) {
        this._element = member;
        this._quantity = quantity;
    }

    /**
     * @returns {T} The Identifiable object of the unit.
     */
    get element(): T {
        return this._element;
    }

    /**
     * @returns {number} The quantity of the unit.
     */
    get quantity(): number {
        return this._quantity;
    }

    /**
     * Adds a specified amount to the current quantity of the unit.
     *
     * @param {number} amount - The amount to add to the current quantity.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    public add(amount: number): Unit<T> {
        return new Unit<T>(this._element, this._quantity + amount);
    }

    /**
     * Subtracts a specified amount from the current quantity of the unit.
     * Optionally applies a floor to the resulting quantity.
     *
     * @param {number} amount - The amount to subtract from the current quantity.
     * @param {number} [floor] - Optional floor to apply to the resulting quantity.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    public minus(amount: number, floor?: number): Unit<T> {
        const targetQuantity = this._quantity - amount;
        if ((typeof floor !== "undefined") && floor > targetQuantity) {
            return new Unit<T>(this._element, floor);
        }
        return new Unit<T>(this._element, targetQuantity);
    }

    /**
     * Inverts the quantity of the unit (multiplies the quantity by -1).
     *
     * @returns {Unit<T>} A new Unit instance with the inverted quantity.
     */
    public invert(): Unit<T> {
        return new Unit<T>(this._element, this._quantity * -1);
    }

    /**
     * Creates a new Unit instance with the same identifiable object and the specified quantity.
     *
     * @param {number} amount - The quantity to set for the new Unit instance.
     * @returns {Unit<T>} A new Unit instance with the specified quantity.
     */
    public withQuantity(amount: number): Unit<T> {
        return new Unit<T>(this._element, amount);
    }

    /**
     * Multiplies the unit quantity by a specified factor.
     *
     * @param {number} factor - The multiplication factor.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    multiply(factor: number): Unit<T> {
        return new Unit<T>(this._element, this._quantity * factor);
    }

    /**
     * Combines the current Unit with another Unit of the same type.
     * The resulting Unit will have the sum of both quantities.
     *
     * @param {Unit<T>} other - The other Unit to combine with the current Unit.
     * @returns {Unit<T>} A new Unit instance with the combined quantities.
     */
    combineWith(other: Unit<T>): Unit<T> {
        return this.add(other.quantity);
    }

    clone() {
        return new Unit<T>(this._element, this._quantity);
    }

    static NONE<T extends Identifiable>() {
        return new Unit<T>(new Nothing() as T, 0);
    }

}

export { Unit };