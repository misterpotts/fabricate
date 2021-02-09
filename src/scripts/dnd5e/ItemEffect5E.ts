enum EffectType {
    DAMAGE = 'DAMAGE',
    AOE = 'AOE',
    DEBUFF = 'DEBUFF',
    DURATION = 'DURATION'
}

enum EffectModifierType {
    ADD = 'ADD',
    MULTIPLY = 'MULTIPLY'
}

interface EffectModifier {
    type: EffectModifierType;
    factor: number;
}

interface ItemEffect5E {
    effectType: EffectType;
    effectModifier: EffectModifier;
}

interface DamageEffect extends ItemEffect5E {
    effectType: EffectType.DAMAGE;
    modifier: EffectModifier;
    method: 'FIXED' | 'ROLLED';
    dice: {
        sides: 4 | 6 | 8 | 10 | 12 | 20 | 100;
        amount: number;
    };
    type: 'acid' | 'force' | 'bludgeoning' | 'slashing' | 'piercing' | 'necrotic' | 'cold' | 'fire' | 'lightning' | 'thunder' | 'psychic' | 'radiant' | 'poison';
}

interface AreaEffect extends ItemEffect5E {
    effectType: EffectType.AOE;

}

export {ItemEffect5E, DamageEffect, AreaEffect}