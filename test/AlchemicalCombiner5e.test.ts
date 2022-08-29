import {beforeEach, describe, expect, jest, test} from '@jest/globals';
import {AlchemicalCombiner5e, Damage5e} from "../src/scripts/5e/AlchemicalEffect5E";
import * as Sinon from "sinon";
import {RollProvider5E} from "../src/scripts/5e/RollProvider5E";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

const stubRollProvider: RollProvider5E = <RollProvider5E><unknown>{
    combine: () => {}
};
const stubCombineMethod = Sandbox.stub(stubRollProvider, 'combine');


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

            const acidDamageOne = new Damage5e({type: "acid", roll: stubRollOne, diceRoller: stubRollProvider});
            const acidDamageTwo = new Damage5e({type: "acid", roll: stubRollTwo, diceRoller: stubRollProvider});
            const coldDamage = new Damage5e({type: "cold", roll: stubRollOne, diceRoller: stubRollProvider});

            stubCombineMethod.onCall(0).returns(stubRollThree);

            const underTest = new AlchemicalCombiner5e();
            const result = underTest.mix([acidDamageOne, coldDamage, acidDamageTwo]);
            expect(result).not.toBeNull();
            expect(result.damageByType.size).toEqual(2);
            expect(result.damageByType.get("acid").roll.formula).toEqual(stubRollThree.formula);

        });

    });

});