import {beforeEach, describe, expect, test} from "@jest/globals";
import * as Sinon from "sinon";

import {PartDictionary} from "../src/scripts/system/PartDictionary";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {FabricateItem} from "../src/scripts/common/FabricateItem";
import {FabricateItemType} from "../src/scripts/compendium/CompendiumData";
import Properties from "../src/scripts/Properties";

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

        expect(underTest.getComponent(testComponentOne.partID extends Item, testComponentOne.systemId)).toBe(testComponentOne);
        expect(underTest.getComponent(testComponentTwo.partID extends Item, testComponentTwo.systemId)).toBe(testComponentTwo);
        expect(underTest.getComponent(testComponentThree.partID extends Item, testComponentThree.systemId)).toBe(testComponentThree);
        expect(underTest.getComponent(testComponentFour.partID extends Item, testComponentFour.systemId)).toBe(testComponentFour);
        expect(underTest.getComponent(testComponentFive.partID extends Item, testComponentFive.systemId)).toBe(testComponentFive);

        expect(underTest.getRecipe(testRecipeOne.partID extends Item, testRecipeOne.systemId)).toBe(testRecipeOne);
        expect(underTest.getRecipe(testRecipeTwo.partID extends Item, testRecipeTwo.systemId)).toBe(testRecipeTwo);
        expect(underTest.getRecipe(testRecipeThree.partID extends Item, testRecipeThree.systemId)).toBe(testRecipeThree);
        expect(underTest.getRecipe(testRecipeFour.partID extends Item, testRecipeFour.systemId)).toBe(testRecipeFour);
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

        const mockOwnedRecipeOneItem: Item<Item.Data<{}>> = mockOwnedItem(FabricateItemType.RECIPE,
            testRecipeOne.partID extends Item,
            testRecipeOne.systemId);
        expect(underTest.recipeFrom(mockOwnedRecipeOneItem)).toBe(testRecipeOne);

        const mockOwnedComponentFourOneItem: Item<Item.Data<{}>> = mockOwnedItem(FabricateItemType.COMPONENT,
            testComponentFour.partID extends Item,
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
        const globalIdentifier: string = FabricateItem.globalIdentifier(partID extends Item, systemId);
        expect(() => underTest.getComponent(partID extends Item, systemId)).toThrow(new Error(`No Component was found with the identifier ${globalIdentifier}. `));
        expect(() => underTest.getRecipe(partID extends Item, systemId)).toThrow(new Error(`No Recipe was found with the identifier ${globalIdentifier}. `));

    });

});

function mockOwnedItem(type: FabricateItemType, partId: string, systemId: string): Item<Item.Data<{}>> {
    const identity = {
        partId: partID extends Item,
        systemId: systemId
    };
    const result: Item<Item.Data<{}>> = <Item<Item.Data<{}>>><unknown>{
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
