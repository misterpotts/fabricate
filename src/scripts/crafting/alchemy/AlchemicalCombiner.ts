import {AlchemicalEffect, AlchemicalEffectType} from "./AlchemicalEffect";

interface AlchemicalCombiner {

    mix(alchemicalEffects: AlchemicalEffect[]): AlchemicalEffect;

}

class DefaultAlchemicalCombiner implements AlchemicalCombiner {

    mix(alchemicalEffects: AlchemicalEffect[]): AlchemicalEffect {
        const effectsByType: Map<AlchemicalEffectType, AlchemicalEffect[]> = alchemicalEffects
            .map(effect => new Map<AlchemicalEffectType, AlchemicalEffect[]>([[effect.type, [effect]]]))
            .reduce((left, right) => {
                for (let [key, value] of right) {
                    if (left.has(key)) {
                        left.get(key).push(...value);
                        return left;
                    }
                    left.set(key, value);
                    return left;
                }
            });
        const preMultiplierEffect: AlchemicalEffect = effectsByType.get(AlchemicalEffectType.BASIC)
            .reduce((left, right) => right.applyTo(left));
        return effectsByType.get(AlchemicalEffectType.MULTIPLIER)
            .reduce((left, right) => right.applyTo(left), preMultiplierEffect);
    }

}

export { AlchemicalCombiner, DefaultAlchemicalCombiner }