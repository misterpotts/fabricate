import {Combination} from "./Combination";

interface Identifiable {
    id: string;
}

interface IdentityProvider<T extends Identifiable> {

    getForCombination(combination: Combination<T>): number;

    getNumericIdentityFor(identifiable: T): number;

}

class HashcodeIdentityProvider<T extends Identifiable> implements IdentityProvider<T> {

    public getForCombination(combination: Combination<T>): number {
        return combination.units
            .map(unit => this.hashcodeForString(unit.part.id) * unit.quantity)
            .reduce((left, right) => left + right, 0);
    }

    private hashcodeForString(value: string): number {
        return [...value].reduce((left, right) => {
            return Math.imul(31, left) + right.charCodeAt(0) | 0;
        }, 0);
    }

    getNumericIdentityFor(identifiable: T): number {
        return this.hashcodeForString(identifiable.id);
    }

}

class PrimeNumberIdentityProvider<T extends Identifiable> implements IdentityProvider<T> {

    private static readonly _primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    private readonly _numericalIdentities: Map<string, number>;
    private readonly _valuesById: Map<string, T>;

    private constructor({
        numericalIdentitiesById = new Map(),
        valuesById = new Map()
    }: {
        numericalIdentitiesById?: Map<string, number>,
        valuesById?: Map<string, T>
    }) {
        this._numericalIdentities = numericalIdentitiesById;
        this._valuesById = valuesById;
    }

    public getNumericIdentityFor(identifiable: T): number {
        return this._numericalIdentities.get(identifiable.id);
    }

    public getValueById(identifiable: T): T {
        return this._valuesById.get(identifiable.id);
    }

    public getForCombination(combination: Combination<T>): number {
        return combination.members.map((identifiable => this.getNumericIdentityFor(identifiable) * combination.amountFor(identifiable)))
            .reduce((left: number, right: number) => left * right, 1);
    }

    public static for<T extends Identifiable>(identifiables: T[]) {
        const identities = PrimeNumberIdentityProvider.assignNumericalIdentities(identifiables);
        const valuesById = new Map(identifiables.map(identifiable => [identifiable.id, identifiable]));
        return new PrimeNumberIdentityProvider({
            numericalIdentitiesById: identities,
            valuesById: valuesById
        });
    }

    private static assignNumericalIdentities<T extends Identifiable>(superset: T[]): Map<string, number> {
        const primes: number[] = this.generatePrimes(superset.length);
        const numericalIdentities: Map<string, number> = new Map();
        superset.forEach((identifiable, index: number) => numericalIdentities.set(identifiable.id, primes[index]));
        return numericalIdentities;
    }

    private static generatePrimes(quantity: number): number[] {
        if (quantity <= PrimeNumberIdentityProvider._primes.length) {
            return PrimeNumberIdentityProvider._primes.slice(0, quantity);
        }
        let candidate = 98;
        while (PrimeNumberIdentityProvider._primes.length < quantity) {
            if (PrimeNumberIdentityProvider._primes.every((p) => candidate % p)) {
                PrimeNumberIdentityProvider._primes.push(candidate);
            }
            candidate++;
        }
        return PrimeNumberIdentityProvider._primes;
    }

}

export { Identifiable, IdentityProvider, PrimeNumberIdentityProvider, HashcodeIdentityProvider };