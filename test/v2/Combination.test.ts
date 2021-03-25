import {expect, jest, test} from "@jest/globals";

import {Combination, Unit} from "../../src/scripts/v2/Combination";
import {CraftingComponent} from "../../src/scripts/v2/CraftingComponent";
beforeEach(() => {
    jest.resetAllMocks();
});

test('Create a Combination from a single Unit',() => {
    const testComponent: CraftingComponent = CraftingComponent.builder()
        .withPartId('ABC123')
        .withSystemId('system-one')
        .withImageUrl('/img/picture.png')
        .withName('Test Component')
        .build();

    const underTest: Combination<CraftingComponent> = Combination.ofUnit(new Unit(testComponent, 1));

    expect(underTest.size()).toBe(1);
    expect(underTest.isEmpty()).toBe(false);
    expect(underTest.contains(testComponent)).toBe(true);
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

    expect(underTest.members).toEqual(expect.arrayContaining([testComponent]));
});