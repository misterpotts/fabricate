import {describe, expect, test} from "@jest/globals";
import {EssenceSelection} from "../src/scripts/actor/EssenceSelection";
import {DefaultCombination} from "../src/scripts/common/Combination";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";
import {
    testComponentFive,
    testComponentFour, testComponentSeven,
    testComponentSix,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {DefaultUnit} from "../src/scripts/common/Unit";

describe("Essence selection", () => {

    test("Should produce closest incomplete selection", () => {

        const required = DefaultCombination.ofUnits([
            new DefaultUnit(elementalWater.toReference(), 2),
            new DefaultUnit(elementalEarth.toReference(), 4)
        ]);

        const underTest = new EssenceSelection(required);

        const availableComponents = DefaultCombination.ofUnits([
            new DefaultUnit(testComponentFive, 1), // 1 Fire, 3 Earth each
            new DefaultUnit(testComponentSix, 1), // 1 Water each
            new DefaultUnit(testComponentTwo, 3), // 2 Fire each
            new DefaultUnit(testComponentFour, 3) //  2 Air Each
        ]);

        // The closest selection is 1xC5 (3xEarth/4xEarth) and 1xC6 (1xWater/2xWater)

        const result = underTest.perform(availableComponents);

        expect(result).not.toBeNull();
        expect(result.size).toEqual(2);
        expect(result.amountFor(testComponentFive.id)).toEqual(1);
        expect(result.amountFor(testComponentSix.id)).toEqual(1);
        const resultantEssenceCombination = result.explode(component => component.essences);
        expect(resultantEssenceCombination.size).toEqual(5);
        expect(resultantEssenceCombination.amountFor(elementalEarth.id)).toEqual(3);
        expect(resultantEssenceCombination.amountFor(elementalWater.id)).toEqual(1);

    });

    test("Should produce smallest complete selection", () => {

        const required = DefaultCombination.ofUnits([
            new DefaultUnit(elementalFire.toReference(), 3),
            new DefaultUnit(elementalAir.toReference(), 1)
        ]);

        const underTest = new EssenceSelection(required);

        const availableComponents = DefaultCombination.ofUnits([
            new DefaultUnit(testComponentFive, 3), // 1 Fire, 3 Earth each
            new DefaultUnit(testComponentTwo, 2), // 2 Fire each
            new DefaultUnit(testComponentSeven, 1), // 1 Air each
            new DefaultUnit(testComponentFour, 1) //  2 Air Each
        ]);

        // The best selection is 2xC2 (4xFire/3xFire) and 1xC7 (1xAir/1xAir)

        const result = underTest.perform(availableComponents);

        expect(result).not.toBeNull();
        expect(result.size).toEqual(3);
        expect(result.amountFor(testComponentTwo.id)).toEqual(2);
        expect(result.amountFor(testComponentSeven.id)).toEqual(1);
        const resultantEssenceCombination = result.explode(component => component.essences);
        expect(resultantEssenceCombination.size).toEqual(5);
        expect(resultantEssenceCombination.amountFor(elementalFire.id)).toEqual(4);
        expect(resultantEssenceCombination.amountFor(elementalAir.id)).toEqual(1);

    });

});