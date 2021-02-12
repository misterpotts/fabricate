type ActionType5e = 'mwak' | 'rwak' | 'rsak' | 'msak' | 'save';
type ActivationType5e = 'action' | 'bonus' | 'reaction' | 'special';
type ItemType5e = 'weapon' | 'equipment' | 'consumable' | 'tool' | 'loot' | 'class' | 'spell' | 'feat' | 'backpack';
type WeaponType5E = 'simpleM' | 'martialM' | 'simpleR' | 'martialR' | 'natural' | 'improv' | 'siege';
type DamageType5E = 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder';

interface ItemData5e extends Item.Data {
    ability?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    actionType?: ActionType5e;
    activation?: {
        type?: ActivationType5e | '';
    };
    attackBonus?: number;
    damage?: {
        parts: Record<string, DamageType5E>;
    };
    duration?: {
        units: string;
        value: number;
    };
    equipped?: boolean;
    level?: number; // spell level if applicable
    preparation?: {
        mode: 'always' | 'prepared';
        prepared: boolean;
    };
    proficient?: boolean;
    properties?: {
        fin?: boolean;
    };
    weaponType?: WeaponType5E;
}

interface Item5e extends Item<ItemData5e> {
    data: {
        _id: string;
        folder: string;
        permission: Record<string, number>;
        data: ItemData5e;
        labels: Record<string, string>;
        type: ItemType5e;
        name: string;
        flags: Record<string, any>;
        img: string;
    };
    labels: Record<string, string>;
    type: ItemType5e;
}

type AbilityBonus = {
    check: string;
    save: string;
    skill: string;
};

type AttackBonus = {
    attack: string;
    damage: string;
};

type SaveBonus = {
    dc: number;
};
