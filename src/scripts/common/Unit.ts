import {Identifiable} from "./Identifiable";

class Unit<T extends Identifiable> {
    private readonly _element: T;
    private readonly _quantity: number;

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

    public add(amount: number): Unit<T> {
        return new Unit<T>(this._element, this._quantity + amount);
    }

    public minus(amount: number, floor?: number): Unit<T> {
        const targetQuantity = this._quantity - amount;
        if (floor && floor > targetQuantity) {
            return new Unit<T>(this._element, floor);
        }
        return new Unit<T>(this._element, targetQuantity);
    }

    public invert(): Unit<T> {
        return new Unit<T>(this._element, this._quantity * -1);
    }

    public withQuantity(amount: number): Unit<T> {
        return new Unit<T>(this._element, amount);
    }

    multiply(factor: number) {
        return new Unit<T>(this._element, this._quantity * factor);
    }

    combineWith(other: Unit<T>) {
        return this.add(other.quantity);
    }

    flatten(): T[] {
        return Array.from(Array(this._quantity).keys()).map(() => this._element);
    }

}

export {Unit};