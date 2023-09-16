import {describe, expect, test} from "@jest/globals";
import {DefaultCraftingSystem} from "../src/scripts/system/CraftingSystem";
import {CraftingSystemDetails} from "../src/scripts/system/CraftingSystemDetails";

describe('Create and configure', () => {

    test('Should create a new Crafting System with no checks and alchemy disabled',() => {

        const testSystemId = `fabricate-test-system`;

        const underTest = new DefaultCraftingSystem({
            craftingSystemDetails: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            disabled: true,
            embedded: false
        });

        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.isDisabled).toEqual(true);

    });

    test('Should create a new Crafting System with checks and support for alchemy',() => {

        const testSystemId = `fabricate-test-system`;
        const underTest = new DefaultCraftingSystem({
            craftingSystemDetails: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            disabled: true,
            embedded: false
        });

        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.isDisabled).toEqual(true);

    });

});