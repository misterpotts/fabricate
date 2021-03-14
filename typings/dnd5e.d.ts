type AbilityType5e = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
type ActionType5e = 'mwak' | 'rwak' | 'rsak' | 'msak' | 'save';
type ActivationType5e = 'action' | 'bonus' | 'reaction' | 'special';
type ItemType5e = 'weapon' | 'equipment' | 'consumable' | 'tool' | 'loot' | 'class' | 'spell' | 'feat' | 'backpack';
type TargetType5e = 'ally' | 'cone' | 'creature' | 'cube'  | 'cylinder' | 'enemy' | 'line' | 'none' | 'object' | 'radius' | 'self' | 'space' | 'sphere' | 'square' | 'wall';
type TargetUnitType5e = 'none' | 'self' | 'touch' | 'special'  | 'any' | 'ft' | 'miles';
type DurationType5e = 'days' | 'hours' | 'instantaneous' | 'minutes' | 'months' | 'permanent' | 'rounds' | 'special' | 'turns' | 'years';
type WeaponType5e = 'simpleM' | 'martialM' | 'simpleR' | 'martialR' | 'natural' | 'improv' | 'siege';
type DamageType5e = 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder' | 'none';

interface ItemData5e {
    ability?: AbilityType5e;
    actionType?: ActionType5e;
    activation?: {
        type?: ActivationType5e | '';
    };
    attackBonus?: number;
    damage?: {
        parts: [string, DamageType5e][];
        versatile: string | '';
    };
    formula?: string | '';
    description?: {
        value: string | '';
        chat: string | '';
        unidentified: string | '';
    };
    duration?: {
        units?: DurationType5e;
        value?: number;
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
    quantity?: number;
    range?: {
        value: number;
        long: number;
        units: TargetUnitType5e;
    };
    save?: {
        ability: AbilityType5e;
        dc: number;
        scaling?: string;
    };
    target?: {
        value?: number;
        width?: number;
        units?: TargetUnitType5e;
        type?: TargetType5e;
    };
    weaponType?: WeaponType5e;
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