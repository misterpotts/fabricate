import {Identifiable} from "./Identifiable";
import {Unit} from "./Unit";

/**
 * Represents a collection of units, each with an element and an associated quantity.
 * The Combination class provides various methods to create, manipulate, and compare combinations of units.
 *
 * @template T - The type of the unit elements that are stored in the Combination. Must extend Identifiable.
 */
class Combination<T extends Identifiable> {

    /*
    * ================================================================
    * INSTANCE MEMBERS
    * ================================================================
    * */

    private readonly _amounts: Map<string, Unit<T>>;

    /*
    * ================================================================
    * CONSTRUCTOR
    * ================================================================
    * */

    private constructor(amounts: Map<string, Unit<T>> = new Map()) {
        this._amounts = amounts;
    }

    /*
    * ================================================================
    * STATIC FACTORY METHODS
    * ================================================================
    * */

    /**
     * Constructs and returns an empty Combination instance.
     *
     * @template T - A type extending Identifiable, representing the member type.
     * @returns {Combination<T>} An empty Combination instance with no Units.
     */
    public static EMPTY<T extends Identifiable>() {
        return new Combination<T>(new Map());
    }

    /**
     * Create a Combination instance from an array of Units. This method consolidates any duplicate Units with the same
     * identifier into a single entry, updating the amount in the resulting Combination.
     *
     * @template T - A type extending Identifiable, representing the member type.
     * @param {Unit<T>[]} units - An array of Units to be combined.
     * @returns {Combination<T>} A new Combination instance containing the unique Units and their consolidated amounts.
     */
    public static ofUnits<T extends Identifiable>(units: Unit<T>[]): Combination<T> {
        const amounts: Map<string, Unit<T>> = new Map();
        units.forEach((unit => {
            if (!amounts.has(unit.element.id)) {
                amounts.set(unit.element.id, unit);
            } else {
                const current: Unit<T> = amounts.get(unit.element.id);
                amounts.set(unit.element.id, current.add(unit.quantity));
            }
        }));
        return new Combination(amounts);
    }

    /**
     * Constructs a Combination instance from a record of identifier-amount pairs and a map of identifier-candidate
     * pairs. This method enables constructing a Combination from serialized or deserialized data by mapping amounts to
     * the appropriate candidate members.
     *
     * @template T - A type extending Identifiable, representing the member type.
     * @param {Record<string, number>} amounts - A record object containing identifier-amount pairs.
     * @param {(key: string) => T} memberProvider - A function that takes the record key and returns the corresponding
     *   combination member.
     * @returns {Combination<T>} A Combination instance containing the Units mapped from the amounts and candidates.
     * @throws {Error} If the memberProvider throws an error when called with a record key.
     */
    public static fromRecord<T extends Identifiable>(amounts: Record<string, number>, memberProvider: (key: string) => T): Combination<T> {
        if (!amounts) {
            return Combination.EMPTY();
        }
        return Object.keys(amounts)
            .map(key => {
                let member: T;
                try {
                    member = memberProvider(key);
                } catch (e: any) {
                    const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
                    throw new Error(`Unable to construct combination member from Record key "${key}". Caused by ${cause.message}`);
                }
                return Combination.of(member, amounts[key]);
            })
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY());
    }

    /**
     * Constructs a Combination instance containing a single member with the specified quantity.
     *
     * @template T - A type extending Identifiable, representing the member type.
     * @param {T} member - The member to be included in the Combination.
     * @param {number} quantity - The quantity of the member in the Combination.
     * @returns {Combination<T>} A Combination instance containing the specified member with the given quantity.
     */
    public static of<T extends Identifiable>(member: T, quantity: number = 1): Combination<T> {
        const unit: Unit<T> = new Unit<T>(member, quantity);
        return Combination.ofUnit(unit);
    }

    /**
     * Constructs a Combination instance from a single Unit.
     *
     * @template T - A type extending Identifiable, representing the member type.
     * @param {Unit<T>} unit - The Unit to be included in the Combination.
     * @returns {Combination<T>} A Combination instance containing the specified Unit.
     */
    public static ofUnit<T extends Identifiable>(unit: Unit<T>): Combination<T> {
        return new Combination<T>(new Map([[unit.element.id, unit]]));
    }

    /*
    * ================================================================
    * INSTANCE METHODS
    * ================================================================
    * */

    /**
     * Constructs a new Combination instance containing only the specified member and its corresponding amount from the
     * current Combination.
     *
     * @template T - A type extending Identifiable, representing the member type.
     * @param {T} member - The member to be included in the resulting Combination.
     * @returns {Combination<T>} A new Combination instance containing only the specified member with its current amount.
     */
    public just(member: T): Combination<T> {
        return new Combination<T>(new Map([[member.id, new Unit<T>(member, this.amountFor(member.id))]]));
    }

    /**
     * Retrieves a copy of the internal map containing the identifier-Unit pairs.
     *
     * @returns {Map<string, Unit<T>>} A new Map object containing the identifier-Unit pairs of the current Combination.
     */
    get amounts(): Map<string, Unit<T>> {
        return new Map(this._amounts);
    }

    /**
     * Computes and retrieves the total size of the Combination, which is the sum of the quantities of all Units.
     *
     * @returns {number} The total size of the Combination.
     */
    get size(): number {
        let size = 0;
        this.amounts.forEach((unit: Unit<T>) => {
            size += unit.quantity;
        });
        return size;
    }

    /**
     * Retrieves the number of distinct Units contained in the Combination.
     *
     * @returns {number} The count of distinct Units in the Combination.
     */
    public distinct(): number {
        return this.amounts.size;
    }

    /**
     * Creates and returns a deep copy of the current Combination instance.
     *
     * @returns {Combination<T>} A new Combination instance containing the same identifier-Unit pairs as the current one.
     */
    public clone(): Combination<T> {
        return new Combination<T>(new Map(this._amounts));
    }

    /**
     * Determines whether the Combination contains the specified member with an optional minimum quantity.
     *
     * @param {T} member - The member to check for in the Combination.
     * @param quantity - The minimum quantity of the member required. The default value is 1.
     * @returns {boolean} True if the Combination contains the specified member with the required quantity, otherwise
     *   false.
     */
    public has(member: T | string, quantity = 1): boolean {
        const memberId = typeof member === "string" ? member : member.id;
        if (!this.amounts.has(memberId)) {
            return false;
        }
        const unit = this._amounts.get(memberId);
        return unit.quantity >= quantity;
    }

    /**
     * Retrieves the quantity of the specified member in the Combination.
     *
     * @param {string | T} member - The member, or its identifier, to retrieve the quantity for.
     * @returns {number} The quantity of the specified member in the Combination, or 0 if the member is not present.
     */
    public amountFor(member: string | T): number {
        const memberId = typeof member === "string" ? member : member.id;
        return this._amounts.has(memberId) ? this._amounts.get(memberId).quantity : 0;
    }

    /**
     * Determines whether the Combination is empty, i.e., contains no Units or has a total size of zero.
     *
     * @returns {boolean} True if the Combination is empty, otherwise false.
     */
    public isEmpty(): boolean {
        return this.size === 0;
    }

    /**
     * Determines whether the current Combination is a subset of the specified Combination.
     * A Combination is a subset of another if all its Units are present in the other Combination with at least the same quantities.
     *
     * @param {Combination<T>} other - The Combination to check against.
     * @returns {boolean} True if the current Combination is a subset of the specified Combination, otherwise false.
     */
    public isIn(other: Combination<T>): boolean {
        for (const unit of this.amounts.values()) {
            if (!other.has(unit.element)) {
                return false;
            }
            const amount: number = other.amountFor(unit.element.id) - this.amountFor(unit.element.id);
            if (amount < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Determines whether the current Combination is a superset of the specified Combination.
     * A Combination is a superset of another if it contains all the Units of the other Combination with at least the same quantities.
     *
     * @param {Combination<T>} other - The Combination to check against.
     * @returns {boolean} True if the current Combination is a superset of the specified Combination, otherwise false.
     */
    public contains(other: Combination<T>): boolean {
        return other.isIn(this);
    }

    /**
     * Retrieves the distinct members (members) contained in the Combination as an array.
     *
     * @returns {T[]} An array of distinct members (members) in the Combination.
     */
    public get members(): T[] {
        const members: T[] = [];
        for (const unit of this.amounts.values()) {
            members.push(unit.element);
        }
        return members;
    }

    /**
     * Retrieves the Units contained in the Combination as an array.
     *
     * @returns {Unit<T>[]} An array of Units in the Combination.
     */
    public get units(): Unit<T>[] {
        const amounts: Unit<T>[] = [];
        for (const unit of this.amounts.values()) {
            amounts.push(unit);
        }
        return amounts;
    }

    /**
     * Merges two Combinations without altering them to produce a new Combination, representing the union of both Combinations.
     * The new Combination contains the sum of the quantities of each Unit present in both the original Combinations.
     *
     * @param {Combination<T>} other - The other Combination to merge with this one.
     * @returns {Combination<T>} A new Combination, resulting from the merge of this Combination and the provided other Combination.
     */
    public combineWith(other: Combination<T>): Combination<T> {
        const combination: Map<string, Unit<T>> = new Map(this.amounts);
        other.units.forEach((otherUnit: Unit<T>) => {
            if (!combination.has(otherUnit.element.id)) {
                combination.set(otherUnit.element.id, otherUnit);
            } else {
                const current: Unit<T> = combination.get(otherUnit.element.id);
                const updated: Unit<T> = current.add(otherUnit.quantity);
                combination.set(otherUnit.element.id, updated);
            }
        });
        return new Combination<T>(combination);
    }

    /**
     * Merges an additional Unit into this Combination without altering it to produce a new Combination,
     * representing the result of adding the new Unit. The new Combination contains the sum of the quantities of the
     * Unit and the existing Unit with the same member in the original Combination.
     *
     * @param {Unit<T>} additionalUnit - The additional Unit to merge into this Combination.
     * @returns {Combination<T>} A new Combination, resulting from the merge of the provided Unit into this Combination.
     */
    public addUnit(additionalUnit: Unit<T>): Combination<T> {
        const amounts: Map<string, Unit<T>> = new Map(this.amounts);
        if (amounts.has(additionalUnit.element.id)) {
            const currentAmount: Unit<T> =  amounts.get(additionalUnit.element.id);
            const updatedAmount: Unit<T> = currentAmount.add(additionalUnit.quantity);
            amounts.set(additionalUnit.element.id, updatedAmount);
        } else {
            amounts.set(additionalUnit.element.id, additionalUnit);
        }
        return new Combination<T>(amounts);
    }

    /**
     * Increments the quantity of a member in the original Combination by the specified quantity.
     * If the member id is provided, and the member is not in the original Combination, an error will be thrown.
     *
     * @param {string | T} memberToIncrement - The ID or instance of the member element to increment in the original Combination.
     * @param {number} [quantity=1] - The quantity to increment the specified member by (default is 1).
     * @returns {Combination<T>} A new Combination with the updated quantity for the specified member.
     * @throws Will throw an error if the memberToIncrement is null, or the member ID is not found in the original Combination.
     */
    public increment(memberToIncrement: string | T, quantity: number = 1): Combination<T> {
        if (!memberToIncrement) {
            throw new Error("Cannot increment a null combination member. ");
        }
        if (( typeof memberToIncrement === "string") && !this._amounts.has(memberToIncrement)) {
            throw new Error(`"${memberToIncrement}" is not present in this combination and cannot be incremented by ID. 
                Check that the ID is correct, or supply the new member element instance. 
                Available member ids are ${Array.from(this._amounts.keys()).join(", ")}. `);
        }
        const additionalUnit = typeof memberToIncrement === "string" ?
            this._amounts.get(memberToIncrement).withQuantity(quantity) : new Unit(memberToIncrement, quantity);
        return this.addUnit(additionalUnit);
    }

    /**
     * Decrements the quantity of a member in the original Combination by the specified quantity.
     * If the member id is provided, and the member is not in the original Combination, an error will be thrown.
     *
     * @param {string | T} memberToDecrement - The ID or instance of the member element to decrement in the original Combination.
     * @param {number} [quantity=1] - The quantity to decrement the specified member by (default is 1).
     * @returns {Combination<T>} A new Combination with the updated quantity for the specified member.
     * @throws Will throw an error if the memberToIncrement is null, or the member ID is not found in the original Combination.
     */
    public decrement(memberToDecrement: string | T, quantity: number = 1): Combination<T> {
        if (!memberToDecrement) {
            throw new Error("Cannot decrement a null combination member. ");
        }
        if (( typeof memberToDecrement === "string") && !this._amounts.has(memberToDecrement)) {
            throw new Error(`"${memberToDecrement}" is not present in this combination and cannot be decremented by ID. 
                Check that the ID is correct, or supply the new member element instance. 
                Available member ids are ${Array.from(this._amounts.keys()).join(", ")}. `);
        }
        const additionalUnit = typeof memberToDecrement === "string" ?
            this._amounts.get(memberToDecrement).withQuantity(quantity) : new Unit(memberToDecrement, quantity);
        return this.subtractUnit(additionalUnit);
    }

    /**
     * Subtracts the quantity of the specified Unit from the original Combination, without altering it,
     * and returns a new Combination with the updated quantity.
     *
     * @param {Unit<T>} subtractedUnit - The Unit to subtract its quantity from the original Combination.
     * @returns {Combination<T>} A new Combination with the updated quantity for the specified Unit's member.
     * If the updated quantity is less than or equal to zero, the member is removed from the new Combination.
     */
    public subtractUnit(subtractedUnit: Unit<T>): Combination<T> {
        const amounts: Map<string, Unit<T>> = new Map(this.amounts);
        if (!amounts.has(subtractedUnit.element.id)) {
            return this.clone();
        }
        const currentAmount: Unit<T> =  amounts.get(subtractedUnit.element.id);
        const updatedAmount: Unit<T> = currentAmount.minus(subtractedUnit.quantity, 0);
        if (updatedAmount.quantity <= 0) {
            amounts.delete(subtractedUnit.element.id);
        } else {
            amounts.set(subtractedUnit.element.id, updatedAmount);
        }
        return new Combination<T>(amounts);
    }

    /**
     * Subtracts the quantities of the members in the provided Combination from the original Combination, without altering it,
     * and returns a new Combination representing the result of the subtraction operation.
     *
     * @param {Combination<T>} other - The other Combination representing the amounts to remove.
     * @returns {Combination<T>} A new Combination, resulting from the subtraction of the other Combination from this one.
     * If the updated quantity for a member is less than or equal to zero, the member is removed from the new Combination.
     */
    public subtract(other: Combination<T>): Combination<T> {
        if (other.isEmpty()) {
            return this.clone();
        }
        const combination: Map<string, Unit<T>> = new Map();
        for (const thisElement of this._amounts.values()) {
            if (!other.has(thisElement.element)) {
                combination.set(thisElement.element.id, thisElement);
            } else {
                const resultingAmount = thisElement.quantity - other.amountFor(thisElement.element.id);
                if (resultingAmount > 0) {
                    combination.set(thisElement.element.id, thisElement.withQuantity(resultingAmount));
                }
            }
        }
        return new Combination<T>(combination);
    }

    /**
     * Removes the specified member from the original Combination without altering it and returns a new Combination
     * representing the result.
     *
     * @param {T} member - The member to remove from the original Combination.
     * @returns {Combination<T>} A new Combination with the specified member removed.
     */
    without(member: T | string) {
        const memberId = typeof member === "string" ? member : member.id;
        const combination: Map<string, Unit<T>> = new Map(this._amounts);
        combination.delete(memberId);
        return new Combination<T>(combination);
    }

    /**
     * Multiplies the quantity of each member in the original Combination by the provided factor without altering it,
     * and returns a new Combination representing the result of the multiplication operation.
     *
     * @param {number} factor - The factor by which to multiply the quantity of each member in the original Combination.
     * @returns {Combination<T>} A new Combination with updated quantities for each member, resulting from the multiplication.
     */
    public multiply(factor: number) {
        const modifiedAmounts: Map<string, Unit<T>> = new Map(this._amounts);
        this.members.forEach((member: T) => {
            const unit: Unit<T> = modifiedAmounts.get(member.id);
            modifiedAmounts.set(member.id, unit.multiply(factor));
        });
        return new Combination(modifiedAmounts);
    }

    /**
     * Checks if the original Combination intersects with the provided Combination, i.e., if they share any common members.
     *
     * @param {Combination<T>} other - The other Combination to check for intersection with the original Combination.
     * @returns {boolean} True if the original Combination and the provided Combination share any common members, otherwise false.
     */
    intersects(other: Combination<T>) {
        return other.members.some((otherMember: T) => this.members.find(value => value.id === otherMember.id) !== undefined);
    }

    /**
     * Transforms the original Combination into a new Combination of a different type by applying the provided transformFunction
     * to each member. The transformFunction returns a new Combination for each member in the original Combination. The quantities
     * of the resulting Combinations are multiplied by the original member's quantity before being merged into the final
     * Combination.
     *
     * @template R - The type of the resulting Combination.
     * @param {(thisType: T) => Combination<R>} transformFunction - The function to transform the members of the original
     * Combination into Combinations of the new type.
     * @returns {Combination<R>} A new Combination of type R, resulting from the transformation and merging of the original
     *  Combination's members.
     */
    explode <R extends Identifiable>(transformFunction: (thisType: T) => Combination<R>): Combination<R> {
        let exploded: Combination<R> = Combination.EMPTY<R>();
        this.amounts.forEach((unit: Unit<T>) => {
            exploded = exploded.combineWith(transformFunction(unit.element).multiply(unit.quantity));
        });
        return exploded;
    }

    /**
     * Checks if the original Combination is equal to the provided Combination. Two Combinations are considered equal
     * if they have the same size and contain the same members with the same quantities.
     *
     * @param {Combination<T>} other - The other Combination to compare with the original Combination.
     * @returns {boolean} True if the original Combination and the provided Combination are equal, otherwise false.
     */
    equals(other: Combination<T>) {
        if (!other) {
            return false;
        }
        if (other.size !== this.size) {
            return false;
        }
        return other.isIn(this) && this.isIn(other);
    }

    /**
     * Converts the Combination to a JSON representation, mapping the member ID to its quantity.
     *
     * @returns {Record<string, number>} A JSON object with member IDs as keys and their corresponding quantities as values.
     */
    public toJson(): Record<string, number> {
        return this.units
            .map(unit => {return {[unit.element.id]: unit.quantity}})
            .reduce((left, right) => {
                return { ...left, ...right}
            }, {});
    }

    map<R = any>(mappingFunction: (unit: Unit<T>) => R): R[] {
        return this.units
            .map(unit => unit.clone())
            .map(mappingFunction);
    }

    convertUnits<R extends Identifiable>(conversionFunction: (unit: Unit<T>) => Unit<R>): Combination<R> {
        return this.units
            .map(unit => unit.clone())
            .map(conversionFunction)
            .reduce((left, right) => left.combineWith(Combination.ofUnit(right)), Combination.EMPTY<R>());
    }

    convertElements<R extends Identifiable>(conversionFunction: (element: T) => R): Combination<R> {
        return this.units
            .map(unit => unit.clone())
            .map(unit => new Unit(conversionFunction(unit.element), unit.quantity))
            .reduce((left, right) => left.combineWith(Combination.ofUnit(right)), Combination.EMPTY<R>());
    }

    /**
     * Computes the intersection of the original Combination with the provided Combination, i.e., the Combination
     *  containing only the members that are present in both Combinations with the minimum quantity of the two.
     *
     * @param other - The other Combination to compute the intersection with.
     * @returns {Combination<T>} A new Combination containing only the members that are present in both Combinations
     *  with the minimum quantity of the two.
     */
    intersectionWith(other: Combination<T>): Combination<T> {
        const intersection: Map<string, Unit<T>> = new Map();
        this.amounts.forEach((unit: Unit<T>) => {
            if (other.has(unit.element)) {
                const minimumAmount = Math.min(unit.quantity, other.amountFor(unit.element.id));
                intersection.set(unit.element.id, new Unit(unit.element, minimumAmount));
            }
        });
        return new Combination<T>(intersection);
    }

}

export { Combination }