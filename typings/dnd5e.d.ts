type AbilityType5e = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
type ActionType5e = 'mwak' | 'rwak' | 'rsak' | 'msak' | 'save';
type ActivationType5e = 'action' | 'bonus' | 'reaction' | 'special';
type ItemType5e = 'weapon' | 'equipment' | 'consumable' | 'tool' | 'loot' | 'class' | 'spell' | 'feat' | 'backpack';
type ToolProficiency5e = 'herb' | 'art' | 'disg' | 'forg'| 'game' | 'music' | 'navg' | 'pois' | 'thief' | 'vehicle';
type TargetType5e = 'ally' | 'cone' | 'creature' | 'cube'  | 'cylinder' | 'enemy' | 'line' | 'none' | 'object' | 'radius' | 'self' | 'space' | 'sphere' | 'square' | 'wall';
type TargetUnitType5e = 'none' | 'self' | 'touch' | 'special'  | 'any' | 'ft' | 'miles';
type DurationType5e = 'days' | 'hours' | 'instantaneous' | 'minutes' | 'months' | 'permanent' | 'rounds' | 'special' | 'turns' | 'years';
type WeaponType5e = 'simpleM' | 'martialM' | 'simpleR' | 'martialR' | 'natural' | 'improv' | 'siege';
type DamageType5e = 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder' | 'none';

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

interface Skill5e {
    value: number
    ability: AbilityType5e
    bonus: number
    mod: number
    passive: number
    prof: number
    total: number
}

interface AbilityDefinition5e {
    value: number;
    proficient: number;
    mod: number;
    save: number;
    prof: number;
}

interface ItemDataValue5e {
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

interface ItemData5e extends Item.Data<ItemDataValue5e> {
    data: ItemDataValue5e;
    effects: ActiveEffect.Data[];
    img: string;
    name: string;
    permission: Entity.Permission;
    sort: number;
    type: ItemType5e;
}

interface Item5e extends Item<ItemData5e> {
    data: ItemData5e;
    img: string;
    name: string;
    sort: number;
    type: ItemType5e;
}

interface ActorDataValue5e {
    abilities: Record<AbilityType5e, AbilityDefinition5e>;
    traits: {
        size: string,
        di: any,
        dr: any,
        dv: any,
        ci: any,
        languages: {
            value: string[],
            custom: ''
        }
        weaponProf: {
            value: string[],
            custom: ''
        }
        armorProf: {
            value: string[],
            custom: ''
        }
        toolProf: {
            value: ToolProficiency5e[],
            custom: '' // comma-separated values in a single string
        }
    },
    attributes: {
        ac: {
            value: number;
            min: number;
        },
        hp: {
            value: number;
            min: number;
            max: number;
            temp: number;
            tempmax: number;
        },
        init: {
            value: number,
            bonus: number,
            mod: number,
            prof: number,
            total: number
        },
        movement: {
            burrow: number
            climb: number
            fly: number
            swim: number
            walk: number
            units: 'ft'
            hover: boolean
        },
        senses: {
            darkvision: number
            blindsight: number
            tremorsense: number
            truesight: number
            units: 'ft'
            special: ''
        },
        spellcasting: AbilityType5e,
        death: {
            success: number,
            failure: number
        },
        encumbrance: {
            value: number,
            max: number,
            pct: number,
            encumbered: boolean
        },
        exhaustion: number,
        inspiration: boolean,
        hd: number,
        prof: number,
        spelldc: number,
        details: any,
        currency: {
            cp: number
            sp: number,
            gp: 5,
            ep: number,
            pp: number,
        },
        skills: {
            acr: Skill5e,
            ani: Skill5e,
            arc: Skill5e,
            ath: Skill5e,
            dec: Skill5e,
            his: Skill5e,
            ins: Skill5e,
            itm: Skill5e,
            inv: Skill5e,
            med: Skill5e,
            nat: Skill5e,
            prc: Skill5e,
            prf: Skill5e,
            per: Skill5e,
            rel: Skill5e,
            slt: Skill5e,
            ste: Skill5e,
            sur: Skill5e
        },
        bonuses: {
            mwak: AttackBonus
            rwak: AttackBonus
            msak: AttackBonus
            rsak: AttackBonus
            abilities: AbilityBonus
            spell: SaveBonus
        },
        spells: any,
        resources: any
    }
}

interface ActorData5e extends Actor.Data<ActorDataValue5e, ItemData5e> {
    data: ActorDataValue5e;
    folder: string;
    img: string;
    items: ItemData5e[];
    name: string;
    permission: Entity.Permission;
    sort: number;
}

interface Actor5e extends Actor<ActorData5e, Item5e> {
    data: ActorData5e;
    token: Token;
    items: Collection<Item5e>;
    effects: Collection<ActiveEffect<this>>
}