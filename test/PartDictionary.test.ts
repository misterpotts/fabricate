import {beforeEach, describe, expect, test} from "@jest/globals";
import * as Sinon from "sinon";

import {PartDictionary} from "../src/scripts/system/PartDictionary";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {FabricateItem} from "../src/scripts/common/FabricateItem";
import {FabricateItemType} from "../src/scripts/compendium/CompendiumData";
import Properties from "../src/scripts/Properties";
import {AnyDocumentData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/data.mjs";
import {Document} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    Sandbox.reset();
});

describe('Create', () => {

    test('Should construct empty Part Dictionary', () => {
        const underTest: PartDictionary = new PartDictionary();

        expect(underTest).not.toBeNull();
        expect(underTest.size()).toBe(0);
    });

});

describe('Index and Retrieve', () => {

    test('Should add and Get Recipes and Components', () => {
        const underTest: PartDictionary = new PartDictionary();

        underTest.addComponent(testComponentOne);
        underTest.addComponent(testComponentTwo);
        underTest.addComponent(testComponentThree);
        underTest.addComponent(testComponentFour);
        underTest.addComponent(testComponentFive);

        underTest.addRecipe(testRecipeOne);
        underTest.addRecipe(testRecipeTwo);
        underTest.addRecipe(testRecipeThree);
        underTest.addRecipe(testRecipeFour);

        expect(underTest).not.toBeNull();
        expect(underTest.size()).toBe(9);

        expect(underTest.getComponent(testComponentOne.partId, testComponentOne.systemId)).toBe(testComponentOne);
        expect(underTest.getComponent(testComponentTwo.partId, testComponentTwo.systemId)).toBe(testComponentTwo);
        expect(underTest.getComponent(testComponentThree.partId, testComponentThree.systemId)).toBe(testComponentThree);
        expect(underTest.getComponent(testComponentFour.partId, testComponentFour.systemId)).toBe(testComponentFour);
        expect(underTest.getComponent(testComponentFive.partId, testComponentFive.systemId)).toBe(testComponentFive);

        expect(underTest.getRecipe(testRecipeOne.partId, testRecipeOne.systemId)).toBe(testRecipeOne);
        expect(underTest.getRecipe(testRecipeTwo.partId, testRecipeTwo.systemId)).toBe(testRecipeTwo);
        expect(underTest.getRecipe(testRecipeThree.partId, testRecipeThree.systemId)).toBe(testRecipeThree);
        expect(underTest.getRecipe(testRecipeFour.partId, testRecipeFour.systemId)).toBe(testRecipeFour);
    });

    test('Should get parts from Item flags', () => {

        const underTest: PartDictionary = new PartDictionary();

        underTest.addComponent(testComponentOne);
        underTest.addComponent(testComponentTwo);
        underTest.addComponent(testComponentThree);
        underTest.addComponent(testComponentFour);
        underTest.addComponent(testComponentFive);

        underTest.addRecipe(testRecipeOne);
        underTest.addRecipe(testRecipeTwo);
        underTest.addRecipe(testRecipeThree);
        underTest.addRecipe(testRecipeFour);

        expect(underTest).not.toBeNull();
        expect(underTest.size()).toBe(9);

        const mockOwnedRecipeOneItem: Document<AnyDocumentData> = mockOwnedItem(FabricateItemType.RECIPE,
            testRecipeOne.partId,
            testRecipeOne.systemId);
        expect(underTest.recipeFrom(mockOwnedRecipeOneItem)).toBe(testRecipeOne);

        const mockOwnedComponentFourOneItem: Document<AnyDocumentData> = mockOwnedItem(FabricateItemType.COMPONENT,
            testComponentFour.partId,
            testComponentFour.systemId);
        expect(underTest.componentFrom(mockOwnedComponentFourOneItem)).toBe(testComponentFour);

    });

    test('Should throw errors when parts are not found', () => {

        const underTest: PartDictionary = new PartDictionary();

        underTest.addComponent(testComponentOne);
        underTest.addComponent(testComponentThree);
        underTest.addComponent(testComponentFour);

        underTest.addRecipe(testRecipeOne);

        expect(underTest).not.toBeNull();
        expect(underTest.size()).toBe(4);

        const partId: string = 'notA';
        const systemId: string = 'validID';
        const globalIdentifier: string = FabricateItem.globalIdentifier(partId, systemId);
        expect(() => underTest.getComponent(partId, systemId)).toThrow(new Error(`No Component was found with the identifier ${globalIdentifier}. `));
        expect(() => underTest.getRecipe(partId, systemId)).toThrow(new Error(`No Recipe was found with the identifier ${globalIdentifier}. `));

    });

});

function mockOwnedItem(type: FabricateItemType, partId: string, systemId: string): Document<AnyDocumentData> {
    const identity = {
        partId: partId,
        systemId: systemId
    };
    const result: Document<AnyDocumentData> = <Document<AnyDocumentData>><unknown>{
        data: {
            flags: {
                fabricate: {
                    identity: identity,
                    type: type
                }
            }
        },
        getFlag: () => {}
    };
    const stubGetFlagMethod = Sandbox.stub(result, 'getFlag');
    stubGetFlagMethod.withArgs(Properties.module.name, Properties.flagKeys.item.fabricateItemType).returns(type);
    stubGetFlagMethod.withArgs(Properties.module.name, Properties.flagKeys.item.identity).returns(identity);
    return result;
}