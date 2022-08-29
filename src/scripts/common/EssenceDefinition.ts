import {Combination} from "./Combination";
import {Identifiable} from "./FabricateItem";

class EssenceDefinition implements Identifiable {

    private readonly _name: string;
    private readonly _slug: string;
    private readonly _description: string;
    private readonly _tooltip: string;
    private readonly _iconCode: string;

    constructor({
        iconCode,
        tooltip,
        description,
        slug,
        name,
    }: {
        iconCode: string;
        tooltip: string;
        description: string;
        slug: string;
        name: string;
    }) {
        this._name = name;
        this._slug = slug;
        this._description = description;
        this._tooltip = tooltip;
        this._iconCode = iconCode;
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

    private readonly _essenceIdentities: Map<string, number>;
    private readonly _essencesBySlug: Map<string, EssenceDefinition>;

    private constructor({
        essenceIdentities = new Map(),
        essencesBySlug = new Map()
    }: {
        essenceIdentities?: Map<string, number>,
        essencesBySlug?: Map<string, EssenceDefinition>
    }) {
        this._essenceIdentities = essenceIdentities;
        this._essencesBySlug = essencesBySlug;
    }

    public getEssenceIdentityBySlug(slug: string): number {
        return this._essenceIdentities.get(slug);
    }

    public getEssenceDefinitionBySlug(slug: string): EssenceDefinition {
        return this._essencesBySlug.get(slug);
    }

    public getForEssenceCombination(combination: Combination<EssenceDefinition>): number {
        return combination.members.map((essence => this.getEssenceIdentityBySlug(essence.slug) * combination.amountFor(essence)))
            .reduce((left: number, right: number) => left * right, 1);
    }

    public static for(essences: EssenceDefinition[]) {
        const essenceIdentities = EssenceIdentityProvider.assignEssenceIdentities(essences);
        const essencesBySlug = new Map(essences.map(essence => [essence.slug, essence]));
        return new EssenceIdentityProvider({
            essenceIdentities: essenceIdentities,
            essencesBySlug: essencesBySlug
        });
    }

    private static assignEssenceIdentities(essences: EssenceDefinition[]): Map<string, number> {
        const primes: number[] = this.generatePrimes(essences.length);
        const essenceIdentities: Map<string, number> = new Map();
        essences.forEach((definition: EssenceDefinition, index: number) => essenceIdentities.set(definition.slug, primes[index]));
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

export { EssenceDefinition, EssenceIdentityProvider }