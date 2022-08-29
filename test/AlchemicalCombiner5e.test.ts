import {beforeEach, describe, expect, jest, test} from '@jest/globals';
import {AlchemicalCombiner5e, Damage5e} from "../src/scripts/5e/AlchemicalEffect5E";
import * as Sinon from "sinon";
import {DiceRoller} from "../src/scripts/foundry/DiceRoller";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

const stubDiceRoller: DiceRoller = <DiceRoller><unknown>{
    combine: () => {}
};
const stubCombineMethod = Sandbox.stub(stubDiceRoller, 'combine');


describe("Alchemical combiner for 5th edition alchemical effects ", () => {

    describe("given three damage effects of two damage types", () => {

        test("should merge the two damage effects of the same type", () => {

            const stubRollOne: Roll = <Roll><unknown>{
                formula: "1d4"
            };
            const stubRollTwo: Roll = <Roll><unknown>{
                formula: "1d6"
            };
            const stubRollThree: Roll = <Roll><unknown>{
                formula: "1d4 + 1d6"
            };

            const acidDamageOne = new Damage5e({type: "acid", roll: stubRollOne, diceRoller: stubDiceRoller});
            const acidDamageTwo = new Damage5e({type: "acid", roll: stubRollTwo, diceRoller: stubDiceRoller});
            const coldDamage = new Damage5e({type: "cold", roll: stubRollOne, diceRoller: stubDiceRoller});

            stubCombineMethod.onCall(0).returns(stubRollThree);

            const underTest = new AlchemicalCombiner5e();
            const result = underTest.mix([acidDamageOne, coldDamage, acidDamageTwo]);
            expect(result).not.toBeNull();
            const itemData: any = {
                damage: {
                    parts: [["1d6", "slashing"]]
                },
                save: {
                    dc: 8
                },
                target: {
                    units: "ft",
                    value: 0
                },
                description: {
                    value: ""
                }
            };
            result.applyToItemData(itemData);
            expect(itemData.damage.parts.length).toEqual(3);
        });

    });

});