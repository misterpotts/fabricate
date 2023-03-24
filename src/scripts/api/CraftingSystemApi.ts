import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";

interface CraftingSystemApi {

    create(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem>;

}

export { CraftingSystemApi };

class DefaultCraftingSystemApi implements CraftingSystemApi {

    create(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem> {
        return Promise.resolve(undefined);
    }

}

export { DefaultCraftingSystemApi };
