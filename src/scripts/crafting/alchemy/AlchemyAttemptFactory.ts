import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";
import {AlchemySpecification} from "./AlchemySpecification";
import {WastageType} from "../../system/specification/CraftingSystemSpecification";
import {EssenceDefinition} from "../../common/EssenceDefinition";
import {AlchemyAttempt, GenerousAlchemyAttempt, WastefulAlchemyAttempt} from "./AlchemyAttempt";

interface AlchemyAttemptFactory<D> {

    make(baseComponent: CraftingComponent, componentSelection: Combination<CraftingComponent>): AlchemyAttempt<D>;

}

interface AlchemyAttemptFactoryConfig<D> {
    components: {
        min: number,
        max:number
    },
    effectMatches: {
        min: number,
        max:number
    },
    alchemySpecification: AlchemySpecification<D>,
    wastage: WastageType;
}

class DefaultAlchemyAttemptFactory<D> implements AlchemyAttemptFactory<D> {

    // @ts-ignore
    private readonly _alchemySpecification: AlchemySpecification<D>;
    private readonly _wastage: WastageType;
    // @ts-ignore
    private readonly _minimumEffectMatches: number;
    private readonly _maximumEffectMatches: number;
    private readonly _minimumComponents: number;
    // @ts-ignore
    private readonly _maximumComponents: number;


    constructor(alchemyAttemptFactoryConfig: AlchemyAttemptFactoryConfig<D>) {
        this._alchemySpecification = alchemyAttemptFactoryConfig.alchemySpecification;
        this._maximumComponents = alchemyAttemptFactoryConfig.components.max;
        this._minimumComponents = alchemyAttemptFactoryConfig.components.min;
        this._maximumEffectMatches = alchemyAttemptFactoryConfig.effectMatches.max;
        this._minimumEffectMatches = alchemyAttemptFactoryConfig.effectMatches.min;
    }

    // @ts-ignore
    make(baseComponent: CraftingComponent, componentSelection: Combination<CraftingComponent>): AlchemyAttempt<D> {
        if (componentSelection.size() > this._maximumEffectMatches || componentSelection.size() < this._minimumComponents) {
            switch (this._wastage) {
                case WastageType.PUNITIVE:
                    return new WastefulAlchemyAttempt();
                case WastageType.NONPUNITIVE:
                    return new GenerousAlchemyAttempt();
            }
        }

        // @ts-ignore
        const essenceCombination: Combination<EssenceDefinition> = componentSelection.explode((component: CraftingComponent) => component.essences);

    }

}

export { AlchemyAttemptFactory, DefaultAlchemyAttemptFactory }