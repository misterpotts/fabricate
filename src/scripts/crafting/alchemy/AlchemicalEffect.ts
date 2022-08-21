enum AlchemicalEffectType {
    MULTIPLIER ,
    BASIC,
    NONE
}

/**
 * @type D The System-Specific, concrete Item Data type to modify when applying  an Alchemical Effect
 * */
interface AlchemicalEffect {

    applyTo(other: AlchemicalEffect): AlchemicalEffect;

    description: string;

}

class NoAlchemicalEffect implements AlchemicalEffect {

    applyTo(other: AlchemicalEffect): any {
        return other;
    }

    get description(): string {
        return "No effect. ";
    }

}

export {AlchemicalEffect, AlchemicalEffectType, NoAlchemicalEffect}