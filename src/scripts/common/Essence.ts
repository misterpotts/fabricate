import {Combinable, Combination} from "./Combination";
import Properties from "../Properties";

interface EssenceJson {
    id: string;
    name: string;
    description: string;
    tooltip: string;
    iconCode: string;
}

class Essence implements Combinable {

    private readonly _name: string;
    private readonly _id: string;
    private readonly _description: string;
    private readonly _tooltip: string;
    private readonly _iconCode: string;

    constructor({
        id,
        name,
        tooltip,
        iconCode = Properties.ui.defaults.essenceIconCode,
        description
    }: {
        id: string;
        name: string;
        tooltip: string;
        iconCode?: string;
        description: string;
    }) {
        this._id = id;
        this._name = name;
        this._tooltip = tooltip;
        this._iconCode = iconCode;
        this._description = description;
    }

    toJson(): EssenceJson {
        return {
            id: this._id,
            name: this._name,
            tooltip: this._tooltip,
            iconCode: this._iconCode,
            description: this._description
        }
    }

    get id(): string {
        return this._id;
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

    get elementId(): string {
        return this._id;
    }

}

class EssenceIdentityProvider {

    private static readonly _primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

    private readonly _essenceIdentities: Map<string, number>;
    private readonly _essencesById: Map<string, Essence>;

    private constructor({
        essenceIdentities = new Map(),
        essencesBySlug = new Map()
    }: {
        essenceIdentities?: Map<string, number>,
        essencesBySlug?: Map<string, Essence>
    }) {
        this._essenceIdentities = essenceIdentities;
        this._essencesById = essencesBySlug;
    }

    public getNumericIdentityByEssenceId(id: string): number {
        return this._essenceIdentities.get(id);
    }

    public getEssenceDefinitionById(id: string): Essence {
        return this._essencesById.get(id);
    }

    public getForEssenceCombination(combination: Combination<Essence>): number {
        return combination.members.map((essence => this.getNumericIdentityByEssenceId(essence.id) * combination.amountFor(essence)))
            .reduce((left: number, right: number) => left * right, 1);
    }

    public static for(essences: Essence[]) {
        const essenceIdentities = EssenceIdentityProvider.assignEssenceIdentities(essences);
        const essencesBySlug = new Map(essences.map(essence => [essence.id, essence]));
        return new EssenceIdentityProvider({
            essenceIdentities: essenceIdentities,
            essencesBySlug: essencesBySlug
        });
    }

    private static assignEssenceIdentities(essences: Essence[]): Map<string, number> {
        const primes: number[] = this.generatePrimes(essences.length);
        const essenceIdentities: Map<string, number> = new Map();
        essences.forEach((essence: Essence, index: number) => essenceIdentities.set(essence.id, primes[index]));
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

export { EssenceJson, Essence, EssenceIdentityProvider }