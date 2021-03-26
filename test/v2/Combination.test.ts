import {expect, jest, test} from "@jest/globals";

import {Combination, Unit} from "../../src/scripts/v2/Combination";
import {CraftingComponent} from "../../src/scripts/v2/CraftingComponent";

beforeEach(() => {
    jest.resetAllMocks();
});

const testComponentOne: CraftingComponent = CraftingComponent.builder()
    .withPartId('ABC123')
    .withSystemId('system-one')
    .withImageUrl('/img/picture.png')
    .withName('Test Component One')
    .build();
const testComponentTwo: CraftingComponent = CraftingComponent.builder()
    .withPartId('ABC234')
    .withSystemId('system-one')
    .withImageUrl('/img/picture.png')
    .withName('Test Component Two')
    .build();
const testComponentThree: CraftingComponent = CraftingComponent.builder()
    .withPartId('ABC345')
    .withSystemId('system-one')
    .withImageUrl('/img/picture.png')
    .withName('Test Component Three')
    .build();
const testComponentFour: CraftingComponent = CraftingComponent.builder()
    .withPartId('ABC456')
    .withSystemId('system-one')
    .withImageUrl('/img/picture.png')
    .withName('Test Component Four')
    .build();
const testComponentFive: CraftingComponent = CraftingComponent.builder()
    .withPartId('ABC567')
    .withSystemId('system-one')
    .withImageUrl('/img/picture.png')
    .withName('Test Component Five')
    .build();

test('Create an empty Combination',() => {
    const underTest: Combination<CraftingComponent> = Combination.EMPTY();

    expect(underTest.size()).toBe(0);
    expect(underTest.isEmpty()).toBe(true);
    expect(underTest.containsPart(testComponentOne)).toBe(false);
    expect(underTest.containsPart(CraftingComponent.builder()
        .withPartId('XYZ345')
        .withSystemId('system-two')
        .withImageUrl('/img/picture.png')
        .withName('Test Component 2')
        .build())).toBe(false);

    const underTestAsUnits: Unit<CraftingComponent>[] = underTest.asUnits();
    expect(underTestAsUnits.length).toBe(0);
});

test('Create a Combination from a single Unit',() => {
    const underTest: Combination<CraftingComponent> = Combination.ofUnit(new Unit(testComponentOne, 1));

    expect(underTest.size()).toBe(1);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.containsPart(testComponentOne)).toBe(true);
    expect(underTest.containsPart(CraftingComponent.builder()
        .withPartId('ABC123')
        .withSystemId('system-one')
        .withImageUrl('/img/picture.png')
        .withName('Test Component')
        .build())).toBe(true);
    expect(underTest.containsPart(CraftingComponent.builder()
        .withPartId('XYZ345')
        .withSystemId('system-two')
        .withImageUrl('/img/picture.png')
        .withName('Test Component 2')
        .build())).toBe(false);

    expect(underTest.members).toEqual(expect.arrayContaining([testComponentOne]));
});

test('Create a Combination from a several Units',() => {
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
    expect(underTest.containsPart(testComponentOne)).toBe(true);
    expect(underTest.containsPart(testComponentTwo)).toBe(true);
    expect(underTest.containsPart(testComponentThree)).toBe(true);
    expect(underTest.containsPart(CraftingComponent.builder()
        .withPartId('ABC123')
        .withSystemId('system-one')
        .withImageUrl('/img/picture.png')
        .withName('Test Component')
        .build())).toBe(true);
    expect(underTest.containsPart(CraftingComponent.builder()
        .withPartId('XYZ345')
        .withSystemId('system-two')
        .withImageUrl('/img/picture.png')
        .withName('Test Component 2')
        .build())).toBe(false);

    expect(underTest.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree]));

    const underTestAsUnits: Unit<CraftingComponent>[] = underTest.asUnits();
    expect(underTestAsUnits.length).toBe(3);
});

test('Create a Combination from combining existing Combinations',() => {
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
    expect(testResultOne.containsPart(testComponentOne)).toBe(true);
    expect(testResultOne.containsPart(testComponentTwo)).toBe(true);
    expect(testResultOne.containsPart(testComponentThree)).toBe(true);
    expect(testResultOne.containsPart(testComponentFour)).toBe(true);
    expect(testResultOne.containsPart(testComponentFive)).toBe(true);
    expect(testResultOne.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive]));

    const sourceC: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentFour, 1),
        new Unit(testComponentFive, 1)
    ]);

    const testResultTwo: Combination<CraftingComponent> = testResultOne.combineWith(sourceC);
    expect(testResultTwo.size()).toBe(17);
    expect(testResultTwo.isEmpty()).toBe(false);
    expect(testResultTwo.containsPart(testComponentOne)).toBe(true);
    expect(testResultTwo.containsPart(testComponentTwo)).toBe(true);
    expect(testResultTwo.containsPart(testComponentThree)).toBe(true);
    expect(testResultTwo.containsPart(testComponentFour)).toBe(true);
    expect(testResultTwo.containsPart(testComponentFive)).toBe(true);
    expect(testResultTwo.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive]));

    const testResultThree: Combination<CraftingComponent> = testResultTwo.add(new Unit(testComponentOne, 10));
    expect(testResultThree.size()).toBe(27);
    expect(testResultThree.isEmpty()).toBe(false);
    expect(testResultThree.containsPart(testComponentOne)).toBe(true);
    expect(testResultThree.containsPart(testComponentTwo)).toBe(true);
    expect(testResultThree.containsPart(testComponentThree)).toBe(true);
    expect(testResultThree.containsPart(testComponentFour)).toBe(true);
    expect(testResultThree.containsPart(testComponentFive)).toBe(true);
    expect(testResultThree.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive]));
});

test('One Combination should contain another', () => {
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

    expect(superset.containsPart(testComponentFour)).toBe(true);
    expect(superset.containsPart(testComponentFive)).toBe(false);
    expect(subset.isIn(superset)).toBe(true);
    expect(superset.isIn(subset)).toBe(false);

    const fiveComponentFours = new Unit(testComponentFour, 5);
    const excludedSubset: Combination<CraftingComponent> = Combination.ofUnits([
        fiveComponentFours
    ]);
    expect(excludedSubset.isIn(superset)).toBe(false);
    expect(superset.isIn(excludedSubset)).toBe(false);
})

test('Subtract one Combination from another', () => {
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
    expect(testResultOne.containsPart(testComponentOne)).toBe(true);
    expect(testResultOne.containsPart(testComponentTwo)).toBe(true);
    expect(testResultOne.containsPart(testComponentThree)).toBe(true);
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
    expect(testResultThree.containsPart(testComponentOne)).toBe(true);
    expect(testResultThree.containsPart(testComponentTwo)).toBe(true);
    expect(testResultThree.containsPart(testComponentThree)).toBe(true);
    expect(testResultThree.amountFor(testComponentOne)).toBe(2);
    expect(testResultThree.amountFor(testComponentTwo)).toBe(7);
    expect(testResultThree.amountFor(testComponentThree)).toBe(5);
});

test('Multiply a Combination by a factor', () => {
    const sourceCombination: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 10),
        new Unit(testComponentTwo, 8),
        new Unit(testComponentThree, 1)
    ]);

    const underTest: Combination<CraftingComponent> = sourceCombination.multiply(3);
    expect(underTest.size()).toBe(57);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.containsPart(testComponentOne)).toBe(true);
    expect(underTest.containsPart(testComponentTwo)).toBe(true);
    expect(underTest.containsPart(testComponentThree)).toBe(true);
    expect(underTest.amountFor(testComponentOne)).toBe(30);
    expect(underTest.amountFor(testComponentTwo)).toBe(24);
    expect(underTest.amountFor(testComponentThree)).toBe(3);
});

test('Two Combinations intersect', () => {
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