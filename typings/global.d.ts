import CharacterAttributes = data5e.CharacterAttributes;
import CommonAttributes = data5e.CommonAttributes;
import CreatureAttributes = data5e.CreatureAttributes;
import CharacterDataSource = data5e.CharacterDataSource;

declare namespace PatchTypes5e {

    interface PatchActor5e extends CharacterDataSource, Actor {
        items: Collection<OwnedItemPatch5e>;
        name: string;
    }

    interface CharacterAbility {
        value: number,
        proficient: number,
        bonuses: {
            check: string,
            save: string
        },
        mod: number,
        save: number,
        prof: number,
        saveBonus: number,
        checkBonus: number,
        dc: number
    }

    interface PatchAttributes5e extends CharacterAttributes, CreatureAttributes, CommonAttributes {
        prof: number
    }

    interface OwnedItemPatch5e extends Item {
        data: {
            name: string;
            data: Item5e;
        }
    }

}

