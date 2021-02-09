import {AbstractEssenceCombiner, AlchemicalResult} from "../../core/Fabricator";
import {CraftingResult} from "../../core/CraftingResult";
import {CraftingComponent} from "../../core/CraftingComponent";
import {ActionType} from "../../core/ActionType";

class AlchemicalBombEssenceCombiner extends AbstractEssenceCombiner {

    constructor() {
        super(6, -1);
    }

    combineAlchemicalResults(alchemicalResults: AlchemicalResult[]): CraftingResult[] {
        const itemDescription = alchemicalResults.map((alchemicalResult: AlchemicalResult) => alchemicalResult.effect.description)
            .reduce((left: string, right: string) => left + right);
        const craftingResult = CraftingResult.builder()
            .withAction(ActionType.ADD)
            .withQuantity(1)
            .withItem(CraftingComponent.builder()
                .withName('Alchemical Bomb')
                .withCompendiumEntry('alchemists-supplies-v11', '90z9nOwmGnP4aUUk')
                .build())
            .withCustomData({ data: { description: itemDescription } })
            .build();
        return [craftingResult];
    }

    availableAlchemicalResults(): AlchemicalResult[] {
        return [
            {
                essences: ['EARTH', 'EARTH'],
                effect: {
                    description: '<p>Throw shrapnel dealing 1d4 piercing damage to other creatures within 10 feet of impact. </p>'
                }
            },
            {
                essences: ['WATER', 'WATER'],
                effect: {
                    description: '<p>Release slippery oil on the ground. Creatures failing a DC 10 Dexterity save fall prone. </p>'
                }
            },
            {
                essences: ['AIR', 'AIR'],
                effect: {
                    description: '<p>Deal 1d4 lightning damage on contact. Double damage to targets touching metal. </p>'
                }
            },
            {
                essences: ['FIRE', 'FIRE'],
                effect: {
                    description: '<p>Deal 1d4 fire damage on hit. Lasts 2 rounds. </p>'
                }
            },
            {
                essences: ['EARTH', 'WATER'],
                effect: {
                    description: '<p>Release gel that sticks to target. Each round, any damage effects continue to deal 1 ' +
                        'damage each until an action is used to remove the gel with a DC 10 Dexterity check. </p>'
                }
            },
            {
                essences: ['WATER', 'AIR'],
                effect: {
                    description: '<p>Deal 1d4 cold damage on contact. Reduce target speed by 15 feet for next round. </p>'
                }
            },
            {
                essences: ['AIR', 'FIRE'],
                effect: {
                    description: '<p>Fill a 10-foot cube with mist for 1d4 rounds. Until it dissipates, any damage effects' +
                        ' repeat each round for creatures remaining within. </p>'
                }
            },
            {
                essences: ['FIRE', 'EARTH'],
                effect: {
                    description: '<p>Deal 1d6 acid damage on contact. </p>'
                }
            },
            {
                essences: ['POSITIVE_ENERGY'],
                effect: {
                    description: '<p>Double number of all damage dice. </p>'
                }
            },
            {
                essences: ['NEGATIVE_ENERGY'],
                effect: {
                    description: '<p>Increase radius of all effects by 5 feet. </p>'
                }
            }
        ];
    }

}

export {AlchemicalBombEssenceCombiner}