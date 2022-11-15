import {expect, jest, test, beforeEach} from "@jest/globals";

import {Combination, Unit} from "../src/scripts/common/Combination";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";

import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";

beforeEach(() => {
    jest.resetAllMocks();
});

test('Should create an empty Combination',() => {
    const underTest: Combination<CraftingComponent> = Combination.EMPTY();

    expect(underTest.size()).toBe(0);
    expect(underTest.isEmpty()).toBe(true);
    expect(underTest.has(testComponentOne)).toBe(false);
    expect(underTest.has(new CraftingComponent({
        id: 'XYZ345',
        salvage: Combination.EMPTY(),
        essences: Combination.EMPTY(),
        name: "Test Component"
    }))).toBe(false);

    const underTestAsUnits: Unit<CraftingComponent>[] = underTest.units;
    expect(underTestAsUnits.length).toBe(0);
});

test('Should create a Combination from a single Unit',() => {
    const underTest: Combination<CraftingComponent> = Combination.ofUnit(new Unit(testComponentOne, 1));

    expect(underTest.size()).toBe(1);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.has(testComponentOne)).toBe(true);
    let equivalentComponent = new CraftingComponent({
        id: testComponentOne.id,
        salvage:testComponentOne.salvage,
        essences: testComponentOne.essences,
        name: testComponentOne.name,
        imageUrl: testComponentOne.imageUrl
    });
    expect(underTest.has(equivalentComponent))
        .toBe(true);
    let nonEquivalentComponent = new CraftingComponent({
        id: 'XYZ345',
        salvage: Combination.EMPTY(),
        essences: Combination.EMPTY(),
        name: "Test Component"
    });
    expect(underTest.has(nonEquivalentComponent))
        .toBe(false);

    expect(underTest.members).toEqual(expect.arrayContaining([testComponentOne]));
});

test('Should create a Combination from a several Units',() => {
    const underTest: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 1),
        new Unit(testComponentOne, 1),
        new Unit(testComponentTwo, 2),
        new Unit(testComponentThree, 3)
    ]);

    expect(underTest.size()).toBe(7);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.amountFor(testComponentOne)).toBe(2);
    expect(underTest.amountFor(testComponentTwo)).toBe(2);
    expect(underTest.amountFor(testComponentThree)).toBe(3);
    expect(underTest.has(testComponentOne)).toBe(true);
    expect(underTest.has(testComponentTwo)).toBe(true);
    expect(underTest.has(testComponentThree)).toBe(true);
    expect(underTest.has(new CraftingComponent({
        id: testComponentOne.id,
        salvage:testComponentOne.salvage,
        essences: testComponentOne.essences,
        name: testComponentOne.name,
        imageUrl: testComponentOne.imageUrl
    }))).toBe(true);
    expect(underTest.has(new CraftingComponent({
        id: 'XYZ345',
        salvage: Combination.EMPTY(),
        essences: Combination.EMPTY(),
        name: "Test Component"
    }))).toBe(false);
    expect(underTest.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree]));
});

test('Should convert a combination to Units',() => {
    const underTest: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 1),
        new Unit(testComponentOne, 1),
        new Unit(testComponentTwo, 2),
        new Unit(testComponentThree, 3)
    ]);

    const underTestAsUnits: Unit<CraftingComponent>[] = underTest.units;

    expect(underTestAsUnits.length).toBe(3);
});

test('Should create a Combination from combining existing Combinations',() => {
    const sourceA: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 1),
        new Unit(testComponentTwo, 2),
        new Unit(testComponentThree, 3)
    ]);

    const sourceB: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentFour, 4),
        new Unit(testComponentFive, 5)
    ]);

    const testResultOne: Combination<CraftingComponent> = sourceA.combineWith(sourceB);
    expect(testResultOne.size()).toBe(15);
    expect(testResultOne.isEmpty()).toBe(false);
    expect(testResultOne.has(testComponentOne)).toBe(true);
    expect(testResultOne.has(testComponentTwo)).toBe(true);
    expect(testResultOne.has(testComponentThree)).toBe(true);
    expect(testResultOne.has(testComponentFour)).toBe(true);
    expect(testResultOne.has(testComponentFive)).toBe(true);
    expect(testResultOne.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive]));

    const sourceC: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentFour, 1),
        new Unit(testComponentFive, 1)
    ]);

    const testResultTwo: Combination<CraftingComponent> = testResultOne.combineWith(sourceC);
    expect(testResultTwo.size()).toBe(17);
    expect(testResultTwo.isEmpty()).toBe(false);
    expect(testResultTwo.has(testComponentOne)).toBe(true);
    expect(testResultTwo.has(testComponentTwo)).toBe(true);
    expect(testResultTwo.has(testComponentThree)).toBe(true);
    expect(testResultTwo.has(testComponentFour)).toBe(true);
    expect(testResultTwo.has(testComponentFive)).toBe(true);
    expect(testResultTwo.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive]));
});

test('Should add one Combination to another', () => {
    const source: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 17),
        new Unit(testComponentTwo, 21),
        new Unit(testComponentThree, 36)
    ]);

    const underTest: Combination<CraftingComponent> = source.add(new Unit(testComponentOne, 10));
    expect(underTest.size()).toBe(84);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.has(testComponentOne)).toBe(true);
    expect(underTest.has(testComponentTwo)).toBe(true);
    expect(underTest.has(testComponentThree)).toBe(true);
    expect(underTest.has(testComponentFour)).toBe(false);
    expect(underTest.has(testComponentFive)).toBe(false);
    expect(underTest.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree]));
    expect(underTest.amountFor(testComponentOne)).toBe(27);
    expect(underTest.amountFor(testComponentTwo)).toBe(21);
    expect(underTest.amountFor(testComponentThree)).toBe(36);
});

test('Should determine when wne Combination contains another', () => {
    const superset: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 1),
        new Unit(testComponentTwo, 2),
        new Unit(testComponentThree, 3),
        new Unit(testComponentFour, 4)
    ]);

    const fourComponentFours = new Unit(testComponentFour, 4);
    const subset: Combination<CraftingComponent> = Combination.ofUnits([
        fourComponentFours
    ]);

    expect(superset.has(testComponentFour)).toBe(true);
    expect(superset.has(testComponentFive)).toBe(false);
    expect(subset.isIn(superset)).toBe(true);
    expect(superset.isIn(subset)).toBe(false);

    const fiveComponentFours = new Unit(testComponentFour, 5);
    const excludedSubset: Combination<CraftingComponent> = Combination.ofUnits([
        fiveComponentFours
    ]);
    expect(excludedSubset.isIn(superset)).toBe(false);
    expect(superset.isIn(excludedSubset)).toBe(false);
})

test('Should subtract one Combination from another', () => {
    const largeCombination: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 10),
        new Unit(testComponentTwo, 10),
        new Unit(testComponentThree, 10)
    ]);

    const smallCombination: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 2),
        new Unit(testComponentTwo, 7),
        new Unit(testComponentThree, 5)
    ]);

    const testResultOne: Combination<CraftingComponent> = largeCombination.subtract(smallCombination);
    expect(testResultOne.size()).toBe(16);
    expect(testResultOne.isEmpty()).toBe(false);
    expect(testResultOne.has(testComponentOne)).toBe(true);
    expect(testResultOne.has(testComponentTwo)).toBe(true);
    expect(testResultOne.has(testComponentThree)).toBe(true);
    expect(testResultOne.amountFor(testComponentOne)).toBe(8);
    expect(testResultOne.amountFor(testComponentTwo)).toBe(3);
    expect(testResultOne.amountFor(testComponentThree)).toBe(5);

    const largestCombination: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 20),
        new Unit(testComponentTwo, 25),
        new Unit(testComponentThree, 50),
        new Unit(testComponentFour, 5)
    ]);

    const testResultTwo: Combination<CraftingComponent> = largeCombination.subtract(largestCombination);
    expect(testResultTwo.size()).toBe(0);
    expect(testResultTwo.isEmpty()).toBe(true);

    const testResultThree: Combination<CraftingComponent> = smallCombination.subtract(Combination.EMPTY());
    expect(testResultThree.size()).toBe(14);
    expect(testResultThree.isEmpty()).toBe(false);
    expect(testResultThree.has(testComponentOne)).toBe(true);
    expect(testResultThree.has(testComponentTwo)).toBe(true);
    expect(testResultThree.has(testComponentThree)).toBe(true);
    expect(testResultThree.amountFor(testComponentOne)).toBe(2);
    expect(testResultThree.amountFor(testComponentTwo)).toBe(7);
    expect(testResultThree.amountFor(testComponentThree)).toBe(5);
});

test('Should multiply a Combination by a factor', () => {
    const sourceCombination: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 10),
        new Unit(testComponentTwo, 8),
        new Unit(testComponentThree, 1)
    ]);

    const underTest: Combination<CraftingComponent> = sourceCombination.multiply(3);
    expect(underTest.size()).toBe(57);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.has(testComponentOne)).toBe(true);
    expect(underTest.has(testComponentTwo)).toBe(true);
    expect(underTest.has(testComponentThree)).toBe(true);
    expect(underTest.amountFor(testComponentOne)).toBe(30);
    expect(underTest.amountFor(testComponentTwo)).toBe(24);
    expect(underTest.amountFor(testComponentThree)).toBe(3);
});

test('Should determine when two Combinations intersect', () => {
    const sourceCombinationA: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 10),
        new Unit(testComponentTwo, 8),
        new Unit(testComponentThree, 1)
    ]);

    const sourceCombinationB: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentThree, 3),
        new Unit(testComponentFour, 80),
        new Unit(testComponentFive, 17)
    ]);

    expect(sourceCombinationA.intersects(sourceCombinationB)).toBe(true);
    expect(sourceCombinationB.intersects(sourceCombinationA)).toBe(true);
    expect(sourceCombinationA.isIn(sourceCombinationB)).toBe(false);
    expect(sourceCombinationB.isIn(sourceCombinationA)).toBe(false);
});