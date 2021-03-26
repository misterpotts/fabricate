import {Identifiable} from "./FabricateItem";

class Unit<T extends Identifiable> {
    private readonly _part: T;
    private readonly _quantity: number;

    constructor(type: T, quantity: number) {
        this._part = type;
        this._quantity = quantity;
    }

    get part(): T {
        return this._part;
    }

    get quantity(): number {
        return this._quantity;
    }

    public add(amount: number): Unit<T> {
        return new Unit<T>(this._part, amount + this._quantity);
    }

    public withQuantity(amount: number): Unit<T> {
        return new Unit<T>(this._part, amount);
    }

    multiply(factor: number) {
        return new Unit<T>(this._part, this._quantity * factor);
    }
}

class Combination<T extends Identifiable> {
    private readonly _amounts: Map<string, Unit<T>>;

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

    public static ofUnit<T extends Identifiable>(unit: Unit<T>): Combination<T> {
        return new Combination<T>(new Map([[unit.part.id, unit]]));
    }

    get amounts(): Map<string, Unit<T>> {
        return this._amounts;
    }

    public size(): number {
        let size = 0;
        this.amounts.forEach((unit: Unit<T>) => {
            size += unit.quantity;
        });
        return size;
    }

    public clone(): Combination<T> {
        return new Combination<T>(new Map(this._amounts));
    }

    public containsPart(member: T): boolean {
        return this.amounts.has(member.id);
    }

    public amountFor(member: T): number {
        return this._amounts.has(member.id) ? this._amounts.get(member.id).quantity : 0;
    }

    public isEmpty(): boolean {
        return this.size() === 0;
    }

    public asUnits(): Unit<T>[] {
        const units: Unit<T>[] = [];
        this.amounts.forEach((unit: Unit<T>) => units.push(unit));
        return units;
    }

    public isIn(other: Combination<T>): boolean {
        for (const unit of this.amounts.values()) {
            if (!other.containsPart(unit.part)) {
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

    public add(additionalUnit: Unit<T>): Combination<T> {
        const amounts: Map<string, Unit<T>> = new Map(this.amounts);
        const currentAmount: Unit<T> =  amounts.get(additionalUnit.part.id);
        const updatedAmount: Unit<T> = currentAmount.add(additionalUnit.quantity);
        amounts.set(additionalUnit.part.id, updatedAmount);
        return new Combination<T>(amounts);
    }

    public subtract(other: Combination<T>): Combination<T> {
        if (other.isEmpty()) {
            return this.clone();
        }
        const combination: Map<string, Unit<T>> = new Map();
        other.amounts.forEach((otherUnit: Unit<T>) => {
            if (!this.containsPart(otherUnit.part)) {
                return;
            }
            const modifiedAmount: number = this.amountFor(otherUnit.part) - otherUnit.quantity;
            if (modifiedAmount > 0) {
                combination.set(otherUnit.part.id, otherUnit.withQuantity(modifiedAmount));
            }
        });
        return new Combination<T>(combination);
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
}

export {Unit, Combination}