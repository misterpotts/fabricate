class Unit<T> {
    private readonly _type: T;
    private readonly _quantity: number;

    constructor(type: T, quantity: number) {
        this._type = type;
        this._quantity = quantity;
    }

    get type(): T {
        return this._type;
    }

    get quantity(): number {
        return this._quantity;
    }
}

class Combination<T> {
    private readonly _members: T[];
    private readonly _amounts: Map<T, number>;

    protected constructor(members: T[], amounts: Map<T, number>) {
        this._members = members;
        this._amounts = amounts;
    }

    public static fromUnits<T>(units: Unit<T>[]) {
        const members: T[] = [];
        const amounts: Map<T, number> = new Map();
        units.forEach((unit => {
            if (!members.includes(unit.type)) {
                members.push(unit.type);
                amounts.set(unit.type, unit.quantity);
            } else {
                amounts.set(unit.type, amounts.get(unit.type) + unit.quantity);
            }
        }));
        return new Combination(members, amounts);
    }

    get members(): T[] {
        return this._members;
    }

    get amounts(): Map<T, number> {
        return this._amounts;
    }

    public clone(): Combination<T> {
        return new Combination<T>(Array.from(this._members), new Map(this._amounts));
    }

    public contains(member: T): boolean {
        return this._members.includes(member);
    }

    public amountFor(member: T): number {
        return this._amounts.has(member) ? this._amounts.get(member) : 0;
    }

    public isEmpty(): boolean {
        return this.members.length === 0 && this._amounts.size === 0;
    }

    public subtract(other: Combination<T>): Combination<T> {
        const members: T[] = [];
        const combination: Map<T, number> = new Map();
        other.amounts.forEach(((subtract: number, member: T) => {
            if (!this.contains(member)) {
                return;
            }
            const modifiedAmount = this.amountFor(member) - subtract;
            if (modifiedAmount > 0) {
                members.push(member);
                combination.set(member, modifiedAmount);
            }
        }));
        return new Combination<T>(members, combination);
    }

    public multiply(factor: number) {
        const modifiedAmounts: Map<T, number> = new Map(this._amounts);
        this.members.forEach((member: T) => {
            modifiedAmounts.set(member, modifiedAmounts.get(member) * factor);
        });
        return new Combination(this._members, modifiedAmounts);
    }

    intersects(other: Combination<T>) {
        return other.members.some((otherMember: T) => this.members.includes(otherMember));
    }
}

export {Unit, Combination}