import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import * as Sinon from "sinon";
import {AlchemicalCombiner} from "../../src/scripts/v2/crafting/alchemy/AlchemicalCombiner";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {AlchemicalEffect, AlchemicalEffectType} from "../../src/scripts/v2/crafting/alchemy/AlchemicalEffect";
import {Combination, Unit} from "../../src/scripts/v2/common/Combination";
import {CraftingComponent} from "../../src/scripts/v2/common/CraftingComponent";
import {DiceUtility} from "../../src/scripts/v2/foundry/DiceUtility";
import {CompendiumProvider} from "../../src/scripts/v2/foundry/CompendiumProvider";
import {ObjectUtility} from "../../src/scripts/v2/foundry/ObjectUtility";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

class TestItemDataType {
    public alchemicalEffectOneApplied: number = 0;
    public alchemicalEffectTwoApplied: number = 0;
    public alchemicalEffectThreeApplied: number = 0;
}

const mockDiceUtility: DiceUtility = <DiceUtility><unknown>{};
const mockCompendiumProvider: CompendiumProvider = <CompendiumProvider><unknown>{
    getEntity: () => {}
};
const stubGetEntityMethod = Sandbox.stub(mockCompendiumProvider, 'getEntity');
const mockObjectUtility: ObjectUtility = <ObjectUtility><unknown>{
    duplicate: () => {}
};
const stubDuplicateObjectMethod = Sandbox.stub(mockObjectUtility, 'duplicate');

class TestAlchemicalEffectOne extends AlchemicalEffect<TestItemDataType> {
    
    constructor() {
        const superBuilder: AlchemicalEffect.Builder<TestItemDataType> = new AlchemicalEffect.Builder<TestItemDataType>()
            .withType(AlchemicalEffectType.BASIC)
            .withDescription('Test Alchemical Effect One')
            .withDiceUtility(mockDiceUtility)
            .withEssenceCombination(testComponentOne.essences);
        super(superBuilder);
    }

    applyTo(itemData: TestItemDataType): TestItemDataType {
        itemData.alchemicalEffectOneApplied += 1;
        return itemData;
    }
    
}

class TestAlchemicalEffectTwo extends AlchemicalEffect<TestItemDataType> {

    constructor() {
        const superBuilder: AlchemicalEffect.Builder<TestItemDataType> = new AlchemicalEffect.Builder<TestItemDataType>()
            .withType(AlchemicalEffectType.BASIC)
            .withDescription('Test Alchemical Effect Two')
            .withDiceUtility(mockDiceUtility)
            .withEssenceCombination(testComponentTwo.essences);
        super(superBuilder);
    }

    applyTo(itemData: TestItemDataType): TestItemDataType {
        itemData.alchemicalEffectTwoApplied += 1;
        return itemData;
    }

}

class TestAlchemicalEffectThree extends AlchemicalEffect<TestItemDataType> {

    constructor() {
        const superBuilder: AlchemicalEffect.Builder<TestItemDataType> = new AlchemicalEffect.Builder<TestItemDataType>()
            .withType(AlchemicalEffectType.MODIFIER)
            .withDescription('Test Alchemical Effect One')
            .withDiceUtility(mockDiceUtility)
            .withEssenceCombination(testComponentThree.essences);
        super(superBuilder);
    }

    applyTo(itemData: TestItemDataType): TestItemDataType {
        itemData.alchemicalEffectThreeApplied += 1;
        return itemData;
    }

}



describe('Create and configure', () => {

    test('Should create an Alchemical Combiner', () => {

        const maxComponents = 6;
        const maxEssences = 6;
        const minEffectMatches = 1;
        const wastageEnabled = true;
        const underTest: AlchemicalCombiner<any> = AlchemicalCombiner.builder<any>()
            .withBaseComponent(testComponentFour)
            .withMaxComponents(maxComponents)
            .withMaxEssences(maxEssences)
            .withSystemEssences([elementalAir, elementalWater, elementalFire, elementalEarth])
            .withMinimumEffectMatches(minEffectMatches)
            .withAlchemicalEffects([
                new TestAlchemicalEffectOne(),
                new TestAlchemicalEffectTwo(),
                new TestAlchemicalEffectThree()
            ])
            .withWastage(wastageEnabled)
            .build();

        expect(underTest).not.toBeNull();
        expect(underTest.baseComponent).toEqual(testComponentFour);
        expect(underTest.maxComponents).toEqual(maxComponents);
        expect(underTest.maxEssences).toEqual(maxEssences);
        expect(underTest.minimumEffectMatches).toEqual(minEffectMatches);
        expect(underTest.wastageEnabled).toEqual(wastageEnabled);
        expect(underTest.effects).toContainEqual(new TestAlchemicalEffectOne());
        expect(underTest.effects.length).toEqual(3);
        expect(underTest.effects).toContainEqual(new TestAlchemicalEffectTwo());
        expect(underTest.effects).toContainEqual(new TestAlchemicalEffectThree());

    });

});

describe('Perform Alchemy', () => {

    describe('Success', () => {

        test('Should apply base effects the correct number of times', async () => {

            const underTest: AlchemicalCombiner<TestItemDataType> = AlchemicalCombiner.builder<TestItemDataType>()
                .withBaseComponent(testComponentFour)
                .withMaxComponents(6)
                .withMaxEssences(6)
                .withSystemEssences([elementalAir, elementalWater, elementalFire, elementalEarth])
                .withMinimumEffectMatches(1)
                .withAlchemicalEffects([
                    new TestAlchemicalEffectOne(),
                    new TestAlchemicalEffectTwo(),
                    new TestAlchemicalEffectThree()
                ])
                .withWastage(true)
                .withObjectUtility(mockObjectUtility)
                .withCompendiumProvider(mockCompendiumProvider)
                .build();

            const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                new Unit<CraftingComponent>(testComponentOne, 1),
                new Unit<CraftingComponent>(testComponentTwo, 2)
            ]);

            // @ts-ignore
            stubGetEntityMethod.withArgs(testComponentFour.systemId, testComponentFour.partId).resolves({data: {data: new TestItemDataType()}});
            stubDuplicateObjectMethod.returns({data: new TestItemDataType()});

            const result: [Unit<CraftingComponent>, Item.Data<TestItemDataType>] = await underTest.perform(testCombination);

            expect(result).not.toBeNull();
            const baseComponent: Unit<CraftingComponent> = result[0];
            expect(baseComponent.quantity).toEqual(1);
            expect(baseComponent.part).toEqual(testComponentFour);
            const resultData: Item.Data<TestItemDataType> = result[1];
            expect(resultData.data.alchemicalEffectOneApplied).toEqual(1);
            expect(resultData.data.alchemicalEffectTwoApplied).toEqual(2);

        });

    });

    describe('Failure', () => {

        test('Should reject an empty component mix with a minimum match count of 1', () => {

            const underTest: AlchemicalCombiner<any> = AlchemicalCombiner.builder<any>()
                .withBaseComponent(testComponentFour)
                .withMaxComponents(6)
                .withMaxEssences(6)
                .withSystemEssences([elementalAir, elementalWater, elementalFire, elementalEarth])
                .withMinimumEffectMatches(1)
                .withAlchemicalEffects([
                    new TestAlchemicalEffectOne(),
                    new TestAlchemicalEffectTwo(),
                    new TestAlchemicalEffectThree()
                ])
                .withWastage(true)
                .build();

            expect(underTest.perform(Combination.EMPTY())).rejects.toThrow(new Error('Too few Alchemical Effects were produced by mixing the provided Components. A minimum of 1 was required, but only 0 were found. '));

        });

        test('Should reject non-matching component mix with a minimum match count of 1', () => {

            const underTest: AlchemicalCombiner<any> = AlchemicalCombiner.builder<any>()
                .withBaseComponent(testComponentFour)
                .withMaxComponents(6)
                .withMaxEssences(6)
                .withSystemEssences([elementalAir, elementalWater, elementalFire, elementalEarth])
                .withMinimumEffectMatches(1)
                .withAlchemicalEffects([
                    new TestAlchemicalEffectOne(),
                    new TestAlchemicalEffectTwo(),
                    new TestAlchemicalEffectThree()
                ])
                .withWastage(true)
                .build();

            const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                new Unit<CraftingComponent>(testComponentFour, 1),
                new Unit<CraftingComponent>(testComponentFive, 1)
            ]);

            expect(underTest.perform(testCombination)).rejects.toThrow(new Error('Too few Alchemical Effects were produced by mixing the provided Components. A minimum of 1 was required, but only 0 were found. '));

        });

        test('Should reject component mix exceeding max essence count', () => {

            const underTest: AlchemicalCombiner<any> = AlchemicalCombiner.builder<any>()
                .withBaseComponent(testComponentFour)
                .withMaxComponents(6)
                .withMaxEssences(6)
                .withSystemEssences([elementalAir, elementalWater, elementalFire, elementalEarth])
                .withMinimumEffectMatches(1)
                .withAlchemicalEffects([
                    new TestAlchemicalEffectOne(),
                    new TestAlchemicalEffectTwo(),
                    new TestAlchemicalEffectThree()
                ])
                .withWastage(true)
                .build();

            const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                new Unit<CraftingComponent>(testComponentFour, 3),
                new Unit<CraftingComponent>(testComponentFive, 2)
            ]);

            expect(underTest.perform(testCombination)).rejects.toThrow(new Error('The Essence Combiner for this system supports a maximum of 6 essences. '));

        });

        test('Should reject component mix exceeding max component count', () => {

            const underTest: AlchemicalCombiner<any> = AlchemicalCombiner.builder<any>()
                .withBaseComponent(testComponentFour)
                .withMaxComponents(6)
                .withMaxEssences(20)
                .withSystemEssences([elementalAir, elementalWater, elementalFire, elementalEarth])
                .withMinimumEffectMatches(1)
                .withAlchemicalEffects([
                    new TestAlchemicalEffectOne(),
                    new TestAlchemicalEffectTwo(),
                    new TestAlchemicalEffectThree()
                ])
                .withWastage(true)
                .build();

            const testCombination: Combination<CraftingComponent> = Combination.ofUnits([
                new Unit<CraftingComponent>(testComponentFour, 3),
                new Unit<CraftingComponent>(testComponentThree, 3),
                new Unit<CraftingComponent>(testComponentFive, 4)
            ]);

            expect(underTest.perform(testCombination)).rejects.toThrow(new Error('The Essence Combiner for this system supports a maximum of 6 components. '));

        });

    });

});
