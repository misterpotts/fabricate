import {HashcodeIdentityProvider, Identifiable, IdentityProvider} from "./Identity";

class StringIdentity implements Identifiable {

    private static readonly _NO_VALUE: StringIdentity = new StringIdentity("");

    private readonly _value: string;

    constructor(value: string) {
        this._value = value;
    }

    public static NO_VALUE(): StringIdentity {
        return StringIdentity._NO_VALUE;
    }

    get id(): string {
        return this._value;
    }

}

class Unit<T extends Identifiable> {
    private readonly _part: T;
    private readonly _quantity: number;

    constructor(part: T, quantity: number) {
        this._part = part;
        this._quantity = quantity;
    }

    get part(): T {
        return this._part;
    }

    get quantity(): number {
        return this._quantity;
    }

    public add(amount: number): Unit<T> {
        return new Unit<T>(this._part, this._quantity + amount);
    }

    public minus(amount: number, floor?: number): Unit<T> {
        const targetQuantity = this._quantity - amount;
        if (floor && floor > targetQuantity) {
            return new Unit<T>(this._part, floor);
        }
        return new Unit<T>(this._part, targetQuantity);
    }

    public invert(): Unit<T> {
        return new Unit<T>(this._part, this._quantity * -1);
    }

    public withQuantity(amount: number): Unit<T> {
        return new Unit<T>(this._part, amount);
    }

    multiply(factor: number) {
        return new Unit<T>(this._part, this._quantity * factor);
    }

    combineWith(other: Unit<T>) {
        return this.add(other.quantity);
    }

    flatten(): T[] {
        return Array.from(Array(this._quantity).keys()).map(() => this._part);
    }

}

class Combination<T extends Identifiable> implements Identifiable{

    private readonly _amounts: Map<string, Unit<T>>;
    private readonly _identityProvider: IdentityProvider<T> = new HashcodeIdentityProvider<T>();

    private constructor(amounts: Map<string, Unit<T>>) {
        this._amounts = amounts;
    }

    /**
     * Constructs and returns an empty Combination
     * */
    public static EMPTY<T extends Identifiable>() {
        return new Combination<T>(new Map());
    }

    /**
     * Create a Combination from an array of Units. Normalizes any duplicate Units into a single entry for an amount
     * within the Combination.
    * */
    public static ofUnits<T extends Identifiable>(units: Unit<T>[]): Combination<T> {
        const amounts: Map<string, Unit<T>> = new Map();
        units.forEach((unit => {
            if (!amounts.has(unit.part.id)) {
                amounts.set(unit.part.id, unit);
            } else {
                const current: Unit<T> = amounts.get(unit.part.id);
                amounts.set(unit.part.id, current.add(unit.quantity));
            }
        }));
        return new Combination(amounts);
    }

    public static of<T extends Identifiable>(member: T, quantity: number): Combination<T> {
        const unit: Unit<T> = new Unit<T>(member, quantity);
        return Combination.ofUnit(unit);
    }

    public static ofUnit<T extends Identifiable>(unit: Unit<T>): Combination<T> {
        return new Combination<T>(new Map([[unit.part.id, unit]]));
    }

    get id(): string {
        return String(this._identityProvider.getForCombination(this));
    }

    public just(member: T): Combination<T> {
        return new Combination<T>(new Map([[member.id, new Unit<T>(member, this.amountFor(member))]]));
    }

    get amounts(): Map<string, Unit<T>> {
        return new Map(this._amounts);
    }

    public size(): number {
        let size = 0;
        this.amounts.forEach((unit: Unit<T>) => {
            size += unit.quantity;
        });
        return size;
    }

    public distinct(): number {
        return this.amounts.size;
    }

    public clone(): Combination<T> {
        return new Combination<T>(new Map(this._amounts));
    }

    public has(member: T): boolean {
        return this.amounts.has(member.id);
    }

    public containsAll(unit: Unit<T>): boolean {
        return this.amounts.get(unit.part.id).quantity >= unit.quantity;
    }

    public amountFor(member: T): number {
        return this._amounts.has(member.id) ? this._amounts.get(member.id).quantity : 0;
    }

    public isEmpty(): boolean {
        return this.size() === 0;
    }

    public isIn(other: Combination<T>): boolean {
        for (const unit of this.amounts.values()) {
            if (!other.has(unit.part)) {
                return false;
            }
            const amount: number = other.amountFor(unit.part) - this.amountFor(unit.part);
            if (amount < 0) {
                return false;
            }
        }
        return true;
    }

    public get members(): T[] {
        const members: T[] = [];
        for (const unit of this.amounts.values()) {
            members.push(unit.part);
        }
        return members;
    }

    public get units(): Unit<T>[] {
        const amounts: Unit<T>[] = [];
        for (const unit of this.amounts.values()) {
            amounts.push(unit);
        }
        return amounts;
    }

    /**
     * Merges two Combinations without altering them to produce a third, representing the union of both Combinations.
     *
     * @param other The other combination to merge with this one
     * @returns a new combination, resulting from a merge of this combination and the other provided combination
     * */
    public combineWith(other: Combination<T>): Combination<T> {
        const combination: Map<string, Unit<T>> = new Map(this.amounts);
        other.units.forEach((otherUnit: Unit<T>) => {
            if (!combination.has(otherUnit.part.id)) {
                combination.set(otherUnit.part.id, otherUnit);
            } else {
                const current: Unit<T> = combination.get(otherUnit.part.id);
                const updated: Unit<T> = current.add(otherUnit.quantity);
                combination.set(otherUnit.part.id, updated);
            }
        });
        return new Combination<T>(combination);
    }

    /**
     * Merges the provided Combination into this one by mutating its contents to represent the union of both
     * Combinations. This is a mutation operation and should be used with care.
     *
     * @param other The other Combination to merge with this one
     * @returns a self-reference (this combination)
     * */
    accept(other: Combination<T>): Combination<T> {
        other.members.forEach((otherMember: T) => {
            if (this.amounts.has(otherMember.id)) {
                const currentAmount: Unit<T> = this.amounts.get(otherMember.id);
                const modifiedAmount: Unit<T> = currentAmount.add(other.amountFor(otherMember));
                this.amounts.set(otherMember.id, modifiedAmount);
            } else {
                this.amounts.set(otherMember.id, new Unit(otherMember, other.amountFor(otherMember)));
            }
        });
        return this;
    }

    /**
     * Merges an additional Unit into this Combination without altering it to produce a third, representing the result
     * of adding the new Unit.
     *
     * @param additionalUnit The additional Unit to merge into this Combination
     * @returns a new Combination, resulting from a merge of the provided Unit into this Combination
     * */
    public add(additionalUnit: Unit<T>): Combination<T> {
        const amounts: Map<string, Unit<T>> = new Map(this.amounts);
        if (amounts.has(additionalUnit.part.id)) {
            const currentAmount: Unit<T> =  amounts.get(additionalUnit.part.id);
            const updatedAmount: Unit<T> = currentAmount.add(additionalUnit.quantity);
            amounts.set(additionalUnit.part.id, updatedAmount);
        } else {
            amounts.set(additionalUnit.part.id, additionalUnit);
        }
        return new Combination<T>(amounts);
    }

    /**
     * Subtracts a Unit from this Combination without altering it to produce a third, representing the result of
     * subtracting the Unit.
     *
     * @param subtractedUnit The Unit to subtract from this Combination
     * @returns a new Combination, resulting from a subtraction of the provided Unit from this Combination
     * */
    public minus(subtractedUnit: Unit<T>): Combination<T> {
        const amounts: Map<string, Unit<T>> = new Map(this.amounts);
        if (!amounts.has(subtractedUnit.part.id)) {
            return this.clone();
        }
        const currentAmount: Unit<T> =  amounts.get(subtractedUnit.part.id);
        const updatedAmount: Unit<T> = currentAmount.minus(subtractedUnit.quantity, 0);
        if (updatedAmount.quantity <= 0) {
            amounts.delete(subtractedUnit.part.id);
        } else {
            amounts.set(subtractedUnit.part.id, updatedAmount);
        }
        return new Combination<T>(amounts);
    }

    /**
     * Removes the contents of the provided Combination from this one without altering it to produce a third,
     * representing the result of the subtraction operation.
     *
     * @param other The other Combination representing the amounts to remove
     * @returns a new Combination, resulting from the subtraction of the other from this one
     * */
    public subtract(other: Combination<T>): Combination<T> {
        if (other.isEmpty()) {
            return this.clone();
        }
        const combination: Map<string, Unit<T>> = new Map();
        for (const thisElement of this._amounts.values()) {
            if (!other.has(thisElement.part)) {
                combination.set(thisElement.part.id, thisElement);
            } else {
                const resultingAmount = thisElement.quantity - other.amountFor(thisElement.part);
                if (resultingAmount > 0) {
                    combination.set(thisElement.part.id, thisElement.withQuantity(resultingAmount));
                }
            }
        }
        return new Combination<T>(combination);
    }

    /**
     * Removes the contents of the provided Combination from this one. This is a mutation operation and should be used
     * with care.
     *
     * @param other The other Combination to remove the contents of from this Combination
     * @returns a self-reference (this combination)
     * */
    drop(other: Combination<T>): Combination<T> {
        other.members.forEach((otherMember: T) => {
            if (this.amounts.has(otherMember.id)) {
                const currentAmount: Unit<T> = this.amounts.get(otherMember.id);
                const deleteUnit: boolean = currentAmount.quantity <= other.amountFor(otherMember);
                switch (deleteUnit) {
                    case true:
                        this.amounts.delete(otherMember.id);
                        break;
                    case false:
                        const modifiedAmount: Unit<T> = currentAmount.withQuantity(currentAmount.quantity - other.amountFor(otherMember));
                        this.amounts.set(otherMember.id, modifiedAmount);
                        break;
                }
            }
        });
        return this;
    }

    public multiply(factor: number) {
        const modifiedAmounts: Map<string, Unit<T>> = new Map(this._amounts);
        this.members.forEach((member: T) => {
            const unit: Unit<T> = modifiedAmounts.get(member.id);
            modifiedAmounts.set(member.id, unit.multiply(factor));
        });
        return new Combination(modifiedAmounts);
    }

    intersects(other: Combination<T>) {
        return other.members.some((otherMember: T) => this.members.includes(otherMember));
    }

    explode <R extends Identifiable>(transformFunction: (thisType: T) => Combination<R>): Combination<R> {
        let exploded: Combination<R> = Combination.EMPTY<R>();
        this.amounts.forEach((unit: Unit<T>) => {
            exploded = exploded.combineWith(transformFunction(unit.part).multiply(unit.quantity));
        });
        return exploded;
    }

    equals(other: Combination<T>) {
        if (!other) {
            return false;
        }
        if (other.size() !== this.size()) {
            return false;
        }
        return other.isIn(this) && this.isIn(other);
    }

    hasPart(partId: string, quantity: number = 1) {
        if (!this._amounts.has(partId)) {
            return false;
        }
        const unit = this._amounts.get(partId);
        return quantity >= unit.quantity;
    }

    public toJson(): Record<string, number> {
        return this.units
            .map(unit => {return {[unit.part.id]: unit.quantity}})
            .reduce((left, right) => {
                return { ...left, ...right}
            }, {});
    }

    flatten(): Combination<StringIdentity> {
        return Combination.ofUnits(this.units.map(unit => new Unit(new StringIdentity(unit.part.id), unit.quantity)));
    }
}

export { Unit, Combination, StringIdentity }