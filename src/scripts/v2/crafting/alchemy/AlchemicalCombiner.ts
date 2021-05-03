import {AlchemicalEffect} from "./AlchemicalEffect";
import {CraftingComponent} from "../../common/CraftingComponent";
import {EssenceDefinition, EssenceIdentityProvider} from "../../common/EssenceDefinition";
import {Combination, Unit} from "../../common/Combination";
import {AlchemyError} from "../../error/AlchemyError";
import {CompendiumProvider} from "../../foundry/CompendiumProvider";
import {ObjectUtility} from "../../foundry/ObjectUtility";

interface EssenceCombinerConfiguration {
    maxComponents: number;
    maxEssences: number;
    minimumEffectMatches: number;
    wastageEnabled: boolean;
}
/**
 * An Alchemical Combiner is responsible for determining which Alchemical Effects, if any, should be applied when
 * performing alchemy and applying them to the Base Component. A Crafting System can support multiple Alchemical
 * Combiners, but each must have its own Base Component, configuration and candidate Alchemical Effects to apply to
 * apply to that Base Component.
 *
 * @typeParam D The System-Specific, concrete Item Data type to modify when applying Alchemical Effects. This type is used to
 * ensure that, for example, only an AlchemicalEffect<ItemDataValue5e> is applied to Item5e when customising Item data
 * through alchemy
* */
class AlchemicalCombiner<D> {
    private readonly _effects: AlchemicalEffect<D>[];
    private readonly _config: EssenceCombinerConfiguration;
    private readonly _baseComponent: CraftingComponent;
    private readonly _essenceIdentityProvider: EssenceIdentityProvider;
    private readonly _effectsByEssenceCombinationIdentity: Map<number, AlchemicalEffect<D>> = new Map();
    private readonly _compendiumProvider: CompendiumProvider;
    private readonly _objectUtility: ObjectUtility;

    public constructor(builder: AlchemicalCombiner.Builder<D>) {
        this._config = builder.config;
        this._effects = builder.effects;
        this._baseComponent = builder.baseComponent;
        const essenceIdentityProvider = EssenceIdentityProvider.for(builder.systemEssences);;
        this._essenceIdentityProvider = essenceIdentityProvider;
        builder.effects.forEach((effect: AlchemicalEffect<D>) => this._effectsByEssenceCombinationIdentity.set(essenceIdentityProvider.getForEssenceCombination(effect.essenceCombination), effect));
        this._compendiumProvider = builder.compendiumProvider;
        this._objectUtility = builder.objectUtility;
    }

    public static builder<D>(): AlchemicalCombiner.Builder<D> {
        return new AlchemicalCombiner.Builder<D>();
    }

    get maxComponents(): number {
        return this._config.maxComponents;
    }

    get maxEssences(): number {
        return this._config.maxEssences;
    }
    
    get minimumEffectMatches(): number {
        return this._config.minimumEffectMatches;
    }
    
    get wastageEnabled(): boolean {
        return this._config.wastageEnabled;
    }

    get effects(): AlchemicalEffect<D>[] {
        return this._effects;
    }

    get baseComponent(): CraftingComponent {
        return this._baseComponent;
    }

    /**
     * Perform Alchemy using the provided Component Combination. The Component combination is validated, before Essences
     * are matched to Alchemical Effects (exact matches are required). The resultant Alchemical Effects are then
     * validated, before being applied to the Base Crafting Component for the Alchemical Combiner to produce custom Item
     * data that can be used by the Crafting System to produce a customised instance of the Base Component.
     *
     * @param componentCombination The combination of Crafting Components to use in the alchemy process.
     * @return The custom Item data resulting from the alchemy process
     * @throws AlchemyError when invariants are broken, such as the maximum number of components or essences that can be
     * mixed, or if insufficient effects are matched
     * */
    async perform(componentCombination: Combination<CraftingComponent>): Promise<[Unit<CraftingComponent>, Item.Data<D>]> {
        const essenceCombination = componentCombination.explode((component: CraftingComponent) => component.essences);
        this.validate(componentCombination, essenceCombination);
        const effects: [AlchemicalEffect<D>, number][] = this.determineAlchemicalEffectsForComponents(componentCombination);
        if (this.minimumEffectMatches > 0 && (!effects || effects.length < this.minimumEffectMatches)) {
            throw new AlchemyError(`Too few Alchemical Effects were produced by mixing the provided Components. A minimum of ${this.minimumEffectMatches} was required, but only ${effects ? effects.length : 0} were found. `, componentCombination, true);
        }
        const orderedEffects: [AlchemicalEffect<D>, number][] = this.orderAlchemicalEffects(effects);
        const alchemyItemData: Item.Data<D> = await this.applyEffectsToBaseItem(orderedEffects, this._baseComponent);
        return [new Unit(this.baseComponent, 1), alchemyItemData];
    }

    private validate(components: Combination<CraftingComponent>, essences: Combination<EssenceDefinition>) {
        if ((this.maxComponents > 0) && (this.maxComponents < components.size())) {
            throw new AlchemyError(`The Essence Combiner for this system supports a maximum of ${this.maxComponents} components. `, components, this.wastageEnabled);
        }
        if (this.maxEssences > 0) {
            if (essences.size() > this.maxEssences) {
                throw new AlchemyError(`The Essence Combiner for this system supports a maximum of ${this.maxEssences} essences. `, components, this.wastageEnabled);
            }
        }
    }

    private async applyEffectsToBaseItem(effects: [AlchemicalEffect<D>, number][], baseComponent: CraftingComponent): Promise<Item.Data<D>> {
        const compendiumEntry: Entity<Item.Data<D>> = await this._compendiumProvider.getEntity(baseComponent.systemId, baseComponent.partId);
        const duplicated: Item.Data<D> = this._objectUtility.duplicate(compendiumEntry.data);
        effects.forEach((effectCount: [AlchemicalEffect<D>, number]) => {
            for (let i = 0; i < effectCount[1]; i++) {
                effectCount[0].applyTo(duplicated.data);
            }
        });
        return duplicated;
    }

    private determineAlchemicalEffectsForComponents(componentCombination: Combination<CraftingComponent>): [AlchemicalEffect<D>, number][] {
        if (componentCombination.isEmpty()) {
            return [];
        }
        return componentCombination.units
            .map(componentUnit => {
                const essenceCombinationIdentity: number = this._essenceIdentityProvider.getForEssenceCombination(componentUnit.part.essences);
                const effectQuantity: number = this._effectsByEssenceCombinationIdentity.has(essenceCombinationIdentity) ? componentUnit.quantity : 0;
                return {identity: essenceCombinationIdentity, quantity: effectQuantity};
            })
            .filter(componentEffects => componentEffects.quantity > 0)
            .map(value => [this._effectsByEssenceCombinationIdentity.get(value.identity), value.quantity]);
    }

    private orderAlchemicalEffects(effects: [AlchemicalEffect<D>, number][]): [AlchemicalEffect<D>, number][] {
        return effects.sort((left: [AlchemicalEffect<D>, number], right: [AlchemicalEffect<D>, number]) => {
            return left[0].type.valueOf() - right[0].type.valueOf();
        });
    }
}

namespace AlchemicalCombiner {

    export class Builder<D> {

        public config: EssenceCombinerConfiguration = {
            maxComponents: 6,
            maxEssences: 6,
            minimumEffectMatches: 1,
            wastageEnabled: true
        };
        public effects: AlchemicalEffect<D>[] = [];
        public baseComponent: CraftingComponent;
        public systemEssences: EssenceDefinition[] = [];
        public compendiumProvider: CompendiumProvider = new CompendiumProvider();
        public objectUtility: ObjectUtility = new ObjectUtility();

        public build(): AlchemicalCombiner<D> {
            return new AlchemicalCombiner<D>(this);
        }

        public withMaxComponents(value: number): Builder<D> {
            this.config.maxComponents = value;
            return this;
        }

        public withMaxEssences(value: number): Builder<D> {
            this.config.maxEssences = value;
            return this;
        }
        
        public withMinimumEffectMatches(value: number): Builder<D> {
            this.config.minimumEffectMatches = value;
            return this;
        }

        public withWastage(value: boolean): Builder<D> {
            this.config.wastageEnabled = value;
            return this;
        }

        public withAlchemicalEffect(value: AlchemicalEffect<D>): Builder<D> {
            this.effects.push(value);
            return this;
        }

        public withAlchemicalEffects(value: AlchemicalEffect<D>[]): Builder<D> {
            this.effects = value;
            return this;
        }

        public withBaseComponent(value:CraftingComponent): Builder<D> {
            this.baseComponent = value;
            return this;
        }

        public withSystemEssences(value: EssenceDefinition[]): Builder<D> {
            this.systemEssences = value;
            return this;
        }

        public withSystemEssence(value: EssenceDefinition): Builder<D> {
            this.systemEssences.push(value);
            return this;
        }

        public withCompendiumProvider(value: CompendiumProvider): Builder<D> {
            this.compendiumProvider = value;
            return this;
        }

        public withObjectUtility(value: ObjectUtility): Builder<D> {
            this.objectUtility = value;
            return this;
        }

    }

}

export {AlchemicalCombiner}