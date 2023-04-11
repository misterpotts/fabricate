import {Combination} from "./Combination";
import {Identifiable} from "./Identifiable";
import {Unit} from "./Unit";

class TrackedUnit<T extends Identifiable> {

    private readonly _target: Unit<T>;
    private readonly _actual: Unit<T>;

    constructor({
        target,
        actual
    }: {
        target: Unit<T>,
        actual: Unit<T>
    }) {
        this._target = target;
        this._actual = actual;
    }

    get target(): Unit<T> {
        return this._target;
    }

    get actual(): Unit<T> {
        return this._actual;
    }

    public get isSufficient(): boolean {
        return this._actual.quantity >= this._target.quantity;
    }

}

class TrackedCombination<T extends Identifiable> {

    private readonly _target: Combination<T>;
    private readonly _actual: Combination<T>;

    constructor({
        target,
        actual = Combination.EMPTY()
    }: {
        target: Combination<T>,
        actual?: Combination<T>
    }) {
        this._target = target;
        this._actual = actual;
    }

    public static EMPTY<T extends Identifiable>() {
        return new TrackedCombination<T>({
            actual: Combination.EMPTY(),
            target: Combination.EMPTY()
        });
    }

    get isEmpty(): boolean {
        return this._target.isEmpty();
    }

    get size(): number {
        return this._target.size;
    }

    get deficit(): number {
        return Math.max(0, this._target.size - this._actual.size);
    }

    get target(): Combination<T> {
        return this._target;
    }

    get actual(): Combination<T> {
        return this._actual;
    }

    public get units(): TrackedUnit<T>[] {
        return this._target.units
            .map(target => new TrackedUnit<T>({
                target,
                actual: new Unit(target.element, this._actual.amountFor(target.element.id))
            }));
    }

    public get isSufficient(): boolean {
        if (this._target.isEmpty()) {
            return true;
        }
        return this.units
            .map(unit => unit.isSufficient)
            .reduce((left, right) => left && right, true);
    }

    amountRequiredFor(id: string) {
        return this._target.amountFor(id);
    }

    amountFoundFor(id: string) {
        return this._actual.amountFor(id);
    }

}

export { TrackedCombination, TrackedUnit }