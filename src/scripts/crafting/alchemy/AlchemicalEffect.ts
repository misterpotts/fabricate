import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

enum AlchemicalEffectType {
    SIMPLE= "SIMPLE",
    MULTIPLIER = "SIMPLE",
    NONE = "NONE"
}

interface AlchemicalEffect {

    canCombineWith(other: AlchemicalEffect): boolean;

    combineWith(other: AlchemicalEffect): AlchemicalEffect;

    describe(): string;

    applyToItemData(itemData: ItemData): ItemData;

    effectName: string;

    effectType: AlchemicalEffectType;

}

class NoAlchemicalEffect implements AlchemicalEffect {

    canCombineWith(other: AlchemicalEffect): boolean {
        return other instanceof NoAlchemicalEffect;
    }

    combineWith(other: any): any {
        return other;
    }

    describe(): string {
        return "No effect. ";
    }

    applyToItemData(itemData: ItemData): ItemData {
        return itemData;
    }

    get effectName(): string {
        return "NONE"
    }

    get effectType(): AlchemicalEffectType {
        return AlchemicalEffectType.NONE
    }

}

export { AlchemicalEffect, NoAlchemicalEffect, AlchemicalEffectType }