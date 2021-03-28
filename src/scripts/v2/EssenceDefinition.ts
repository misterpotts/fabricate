import {Combination} from "./Combination";
import {Identifiable} from "./FabricateItem";

class EssenceDefinition implements Identifiable {

    private readonly _name: string;
    private readonly _slug: string;
    private readonly _description: string;
    private readonly _tooltip: string;
    private readonly _iconCode: string;

    constructor(builder: EssenceDefinition.Builder) {
        this._name = builder.name;
        this._slug = builder.name.toLowerCase().replace(' ', '-');
        this._description = builder.description;
        this._tooltip = builder.tooltip;
        this._iconCode = builder.iconCode;
    }

    public static builder() {
        return new EssenceDefinition.Builder();
    }

    get id(): string {
        return this._slug;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get tooltip(): string {
        return this._tooltip;
    }

    get iconCode(): string {
        return this._iconCode;
    }

    get icon(): string {
        if (this.iconCode) {
            return `<i class="fas fa-${this._iconCode}" title="${this.description}"></i>`;
        }
        return this.name;
    }

    get slug(): string {
        return this._slug;
    }

}

class EssenceIdentityProvider {

    private static readonly _primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    private readonly _essenceIdentities: Map<EssenceDefinition, number>;

    private constructor(essenceIdentities: Map<EssenceDefinition, number>) {
        this._essenceIdentities = essenceIdentities;
    }

    public getForEssence(essence: EssenceDefinition): number {
        return this._essenceIdentities.get(essence);
    }

    public getForEssenceCombination(combination: Combination<EssenceDefinition>): number {
        return combination.members.map((essence => this.getForEssence(essence) * combination.amountFor(essence)))
            .reduce((left: number, right: number) => left * right, 1);
    }

    public static for(essences: EssenceDefinition[]) {
        return new EssenceIdentityProvider(EssenceIdentityProvider.assignEssenceIdentities(essences));
    }

    private static assignEssenceIdentities(essences: EssenceDefinition[]): Map<EssenceDefinition, number> {
        const primes: number[] = this.generatePrimes(essences.length);
        const essenceIdentities: Map<EssenceDefinition, number> = new Map();
        essences.forEach((definition: EssenceDefinition, index: number) => essenceIdentities.set(definition, primes[index]));
        return essenceIdentities;
    }

    private static generatePrimes(quantity: number): number[] {
        if (quantity <= EssenceIdentityProvider._primes.length) {
            return EssenceIdentityProvider._primes.slice(0, quantity);
        }
        let candidate = 98;
        while (EssenceIdentityProvider._primes.length < quantity) {
            if (EssenceIdentityProvider._primes.every((p) => candidate % p)) {
                EssenceIdentityProvider._primes.push(candidate);
            }
            candidate++;
        }
        return EssenceIdentityProvider._primes;
    }

}

namespace EssenceDefinition {

    export class Builder {

        public name: string;
        public description: string;
        public tooltip: string;
        public iconCode: string;

        public build(): EssenceDefinition {
            return new EssenceDefinition(this);
        }

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

        public withDescription(value: string): Builder {
            this.description = value;
            return this;
        }

        public withTooltip(value: string) {
            this.tooltip = value;
            return this;
        }

        public withIconCode(value: any): Builder {
            this.iconCode = value;
            return this;
        }

    }

}

export {EssenceDefinition, EssenceIdentityProvider}