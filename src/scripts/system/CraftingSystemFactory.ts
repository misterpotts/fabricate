import {DefaultCraftingSystem, CraftingSystemJson, CraftingSystem} from "./CraftingSystem";
import {CraftingSystemDetails} from "./CraftingSystemDetails";
import {EntityFactory} from "../repository/EntityFactory";

class CraftingSystemFactory implements EntityFactory<CraftingSystemJson, CraftingSystem> {

    public async make(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem> {

        return new DefaultCraftingSystem({
            id: craftingSystemJson.id,
            embedded: craftingSystemJson.embedded,
            craftingSystemDetails: new CraftingSystemDetails({
                name: craftingSystemJson.details.name,
                summary: craftingSystemJson.details.summary,
                description: craftingSystemJson.details.description,
                author: craftingSystemJson.details.author,
            }),
            disabled: craftingSystemJson.disabled,
        });

    }

}

export {CraftingSystemFactory}