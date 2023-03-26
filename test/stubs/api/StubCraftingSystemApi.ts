import {CraftingSystemApi} from "../../../src/scripts/api/CraftingSystemApi";
import {CraftingSystem, UserDefinedCraftingSystem} from "../../../src/scripts/system/CraftingSystem";
import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {CraftingSystemDetails} from "../../../src/scripts/system/CraftingSystemDetails";

class StubCraftingSystemApi implements CraftingSystemApi {

    private readonly _identityFactory: IdentityFactory;

    async create(): Promise<CraftingSystem> {
        return new UserDefinedCraftingSystem({
            id: this._identityFactory.make(),
            craftingSystemDetails: new CraftingSystemDetails({
                name: "Crafting system name",
                summary: "Crafting system summary",
                description: "Crafting system description",
                author: "No author"
            }),
            enabled: false
        });
    }

}

export { StubCraftingSystemApi }