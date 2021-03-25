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
    expect(underTest.contains(testComponentOne)).toBe(false);
    expect(underTest.contains(CraftingComponent.builder()
        .withPartId('XYZ345')
        .withSystemId('system-two')
        .withImageUrl('/img/picture.png')
        .withName('Test Component 2')
        .build())).toBe(false);
});

test('Create a Combination from a single Unit',() => {
    const underTest: Combination<CraftingComponent> = Combination.ofUnit(new Unit(testComponentOne, 1));

    expect(underTest.size()).toBe(1);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.contains(testComponentOne)).toBe(true);
    expect(underTest.contains(CraftingComponent.builder()
        .withPartId('ABC123')
        .withSystemId('system-one')
        .withImageUrl('/img/picture.png')
        .withName('Test Component')
        .build())).toBe(true);
    expect(underTest.contains(CraftingComponent.builder()
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
        new Unit(testComponentTwo, 2),
        new Unit(testComponentThree, 3)
    ]);

    expect(underTest.size()).toBe(6);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.contains(testComponentOne)).toBe(true);
    expect(underTest.contains(testComponentTwo)).toBe(true);
    expect(underTest.contains(testComponentThree)).toBe(true);
    expect(underTest.contains(CraftingComponent.builder()
        .withPartId('ABC123')
        .withSystemId('system-one')
        .withImageUrl('/img/picture.png')
        .withName('Test Component')
        .build())).toBe(true);
    expect(underTest.contains(CraftingComponent.builder()
        .withPartId('XYZ345')
        .withSystemId('system-two')
        .withImageUrl('/img/picture.png')
        .withName('Test Component 2')
        .build())).toBe(false);

    expect(underTest.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree]));
});

test('Create a Combination from combining two existing Combinations',() => {
    const sourceA: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentOne, 1),
        new Unit(testComponentTwo, 2),
        new Unit(testComponentThree, 3)
    ]);

    const sourceB: Combination<CraftingComponent> = Combination.ofUnits([
        new Unit(testComponentFour, 4),
        new Unit(testComponentFive, 5)
    ]);

    const underTest: Combination<CraftingComponent> = sourceA.combineWith(sourceB);
    expect(underTest.size()).toBe(15);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.contains(testComponentOne)).toBe(true);
    expect(underTest.contains(testComponentTwo)).toBe(true);
    expect(underTest.contains(testComponentThree)).toBe(true);
    expect(underTest.contains(testComponentFour)).toBe(true);
    expect(underTest.contains(testComponentFive)).toBe(true);
    expect(underTest.members).toEqual(expect.arrayContaining([testComponentOne, testComponentTwo, testComponentThree, testComponentFour, testComponentFive]));
});