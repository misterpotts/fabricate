enum AlchemicalEffectType {
    MULTIPLIER ,
    BASIC,
    NONE
}

/**
 * @type D The System-Specific, concrete Item Data type to modify when applying  an Alchemical Effect
 * */
interface AlchemicalEffect<D>{

    applyTo(itemData: D): D;

    description: string;

    type: AlchemicalEffectType;

}

class NoAlchemicalEffect implements AlchemicalEffect<any>{

    applyTo(itemData: any): any {
        return itemData;
    }

    get description(): string {
        return "No effect. ";
    }

    get type(): AlchemicalEffectType {
        return AlchemicalEffectType.NONE;
    }

}

export {AlchemicalEffect, AlchemicalEffectType, NoAlchemicalEffect}