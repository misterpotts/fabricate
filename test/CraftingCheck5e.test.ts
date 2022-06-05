import {expect, jest, test, beforeEach, describe} from "@jest/globals";
import * as Sinon from "sinon";

import {CraftingCheck5e} from "../src/scripts/5e/CraftingCheck5eOld";
import {Tool} from "../src/scripts/crafting/Tool";
import {DiceUtility, RollResult} from "../src/scripts/foundry/DiceUtility";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";
import {testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {OutcomeType} from "../src/scripts/core/OutcomeType";
import {CraftingCheckResult} from "../src/scripts/crafting/check/CraftingCheckResult";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

const mockDiceRoller: DiceUtility = <DiceUtility><unknown>{
    roll: () => {}
};
const stubRollMethod = Sandbox.stub(mockDiceRoller, 'roll');

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('Create', () => {

    test('Should create a Crafting Check 5e',() => {
        const testTool: Tool = new Tool('Alchemist\'s Supplies', 'Alchemy');

        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility('int')
            .withBaseDC(10)
            .withTool(testTool)
            .withEssenceDCModifier(1)
            .withIngredientDCModifier(2)
            .build();

        expect(underTest.ability).toBe('int');
        expect(underTest.baseThreshold).toBe(10);
        expect(underTest.ingredientCountModifier).toBe(2);
        expect(underTest.essenceTypeCountModifier).toBe(1);
        expect(underTest.tool.displayName).toBe('Alchemist\'s Supplies');
        expect(underTest.tool.proficiencyLabel).toBe('Alchemy');
    });

});

describe('Perform', () => {

    test('Should succeed with ingredient DC contribution when result equals threshold without tool proficiency',() => {
        const craftingAbility = 'int';
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withEssenceDCModifier(0)
            .withIngredientDCModifier(2)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 16; // 10 base, 0 from Essence modifier contribution 6 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 1), // (1 Fire) x2
            new Unit<CraftingComponent>(testComponentThree, 1) // (2x Water, 2x Air) x1
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 2, ['Cartographer\'s Tools']);

        const rollResult: number = 16;
        const rollExpression: string = '1d20+2';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.SUCCESS);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

    test('Should succeed with ingredient DC contribution when result exceeds threshold without tool proficiency',() => {
        const craftingAbility = 'wis';
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withEssenceDCModifier(0)
            .withIngredientDCModifier(2)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 14; // 10 base, 0 from Essence modifier contribution 4 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 1), // (1 Fire) x2
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 2, ['Cartographer\'s Tools']);

        const rollResult: number = 18;
        const rollExpression: string = '1d20+2';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.SUCCESS);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

    test('Should succeed with essence DC contribution when result equals threshold without tool proficiency',() => {
        const craftingAbility = 'int';
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withEssenceDCModifier(1)
            .withIngredientDCModifier(0)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 12; // 10 base, 2 from Essence modifier contribution 0 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 2), // (1 Fire) x2
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 2, ['Cartographer\'s Tools']);

        const rollResult: number = 12;
        const rollExpression: string = '1d20+2';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.SUCCESS);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

    test('Should succeed with essence and ingredient DC contribution when result equals threshold without tool proficiency',() => {
        const craftingAbility = 'wis';
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withEssenceDCModifier(1)
            .withIngredientDCModifier(1)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 15; // 10 base, 2 from Essence modifier contribution 3 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 2), // (1 Fire) x2
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 2, ['Cartographer\'s Tools']);

        const rollResult: number = 15;
        const rollExpression: string = '1d20+2';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.SUCCESS);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

    test('Should succeed with ingredient DC contribution when result equals threshold with tool proficiency and tool owned',() => {
        const craftingAbility = 'int';
        const tool: Tool = new Tool('Brewer\'s Supplies', 'Brewer\'s Supplies');
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withTool(tool)
            .withEssenceDCModifier(0)
            .withIngredientDCModifier(2)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 18; // 10 base, 0 from Essence modifier contribution 8 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 2), // (1 Fire) x2
            new Unit<CraftingComponent>(testComponentThree, 1) // (2x Water, 2x Air) x1
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 3, ['Brewer\'s Supplies'], tool);

        const rollResult: number = 18;
        const rollExpression: string = '1d20+2+3';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.SUCCESS);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2', '+3'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

    test('Should succeed with ingredient DC contribution when result equals threshold with custom tool proficiency and tool owned',() => {
        const craftingAbility = 'int';
        const tool: Tool = new Tool('Thingoscope', 'Thingoscope');
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withTool(tool)
            .withEssenceDCModifier(0)
            .withIngredientDCModifier(2)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 18; // 10 base, 0 from Essence modifier contribution 8 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 2), // (1 Fire) x2
            new Unit<CraftingComponent>(testComponentThree, 1) // (2x Water, 2x Air) x1
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 3, ['Thingoscope'], tool, true);

        const rollResult: number = 18;
        const rollExpression: string = '1d20+2+2';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.SUCCESS);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2', '+3'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

    test('Should succeed with ingredient DC contribution when result equals threshold with tool proficiency and tool not owned',() => {
        const craftingAbility = 'int';
        const tool: Tool = new Tool('Brewer\'s Supplies', 'Brewer\'s Supplies');
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withTool(tool)
            .withEssenceDCModifier(0)
            .withIngredientDCModifier(2)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 18; // 10 base, 0 from Essence modifier contribution 8 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 2), // (1 Fire) x2
            new Unit<CraftingComponent>(testComponentThree, 1) // (2x Water, 2x Air) x1
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 3, ['Brewer\'s Supplies']);

        const rollResult: number = 18;
        const rollExpression: string = '1d20+2+3';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.SUCCESS);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

    test('Should fail with ingredient DC contribution when result is below threshold without tool proficiency',() => {
        const craftingAbility = 'int';
        const underTest: CraftingCheck5e = CraftingCheck5e.builder()
            .withAbility(craftingAbility)
            .withBaseDC(10)
            .withEssenceDCModifier(0)
            .withIngredientDCModifier(2)
            .withDiceRoller(mockDiceRoller)
            .build();

        const expectedDC: number = 20; // 10 base, 0 from Essence modifier contribution 10 from ingredient count modifier
        const testComponents: Combination<CraftingComponent> = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1), // (2x Earth) x1
            new Unit<CraftingComponent>(testComponentTwo, 2), // (1 Fire) x2
            new Unit<CraftingComponent>(testComponentThree, 2) // (2x Water, 2x Air) x1
        ]);

        const mockActor5e: Actor5e = mockActorData(craftingAbility, 2, 2, ['Cartographer\'s Tools']);

        const rollResult: number = 17;
        const rollExpression: string = '1d20+2';
        stubRollMethod.returns(new RollResult(rollResult, rollExpression));

        const checkResult: CraftingCheckResult = underTest.perform(mockActor5e, testComponents);

        expect(checkResult).not.toBeNull();
        expect(checkResult.outcome).toBe(OutcomeType.FAILURE);
        expect(checkResult.successThreshold).toBe(expectedDC);
        expect(checkResult.result).toBe(rollResult);
        expect(checkResult.expression).toBe(rollExpression);

        Sandbox.assert.calledOnce(stubRollMethod);
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('number', 1));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('faces', 20));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('modifiers', Sandbox.match.array.contains(['+2'])));
        Sandbox.assert.calledWith(stubRollMethod, Sandbox.match.has('options', Sandbox.match.object));
    });

});

function mockActorData(ability: string, modifier: number, prof: number, proficiencies: string[] = [], tool?: Tool, addCustomProficiency: boolean = false): Actor5e {
    const mockActorData: Actor5e = <Actor5e><unknown>{
        data: {
            type: 'creature',
            data: {
                abilities: {},
                traits: {
                    toolProf: {
                        values: proficiencies,
                        custom: ''
                    }
                },
                attributes: {
                    prof: prof
                }
            }
        },
        items: []
    };
    // @ts-ignore
    mockActorData.data.data.abilities[ability] = {value: (10 + (modifier * 2)), mod: modifier};
    if (tool) {
        // @ts-ignore
        mockActorData.items.push({type: 'tool', name: tool.displayName});
    }
    if (addCustomProficiency) {
        // @ts-ignore
        mockActorData.data.data.traits.toolProf.custom += tool.proficiencyLabel;
    }
    return mockActorData;
}

