import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {CraftingSystem} from "../src/scripts/system/CraftingSystem";
import * as Sinon from "sinon";
import {testPartDictionary} from "./test_data/TestPartDictionary";
import {CraftingSystemDetails} from "../src/scripts/system/CraftingSystemDetails";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('Create and configure', () => {

    test('Should create a new Crafting System with no checks and alchemy disabled',() => {

        const testSystemId = `fabricate-test-system`;

        const underTest = new CraftingSystem({
            details: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            enabled: true,
            locked: false,
            partDictionary: testPartDictionary
        });

        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toEqual(true);

    });

    test('Should create a new Crafting System with checks and support for alchemy',() => {

        const testSystemId = `fabricate-test-system`;
        const underTest = new CraftingSystem({
            details: new CraftingSystemDetails({
                name: "Test System",
                author: "",
                summary: "",
                description: ""
            }),
            id: testSystemId,
            enabled: true,
            locked: false,
            partDictionary: testPartDictionary
        });

        expect(underTest).not.toBeNull();
        expect(underTest.id).toEqual(testSystemId);
        expect(underTest.enabled).toEqual(true);

    });

});