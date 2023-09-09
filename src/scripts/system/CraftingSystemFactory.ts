import {DefaultCraftingSystem, CraftingSystemJson} from "./CraftingSystem";
import {CraftingSystemDetails} from "./CraftingSystemDetails";
import {EntityFactory} from "../repository/EntityFactory";

class CraftingSystemFactory implements EntityFactory<CraftingSystemJson, DefaultCraftingSystem> {

    public async make(craftingSystemJson: CraftingSystemJson): Promise<DefaultCraftingSystem> {

        return new DefaultCraftingSystem({
            id: craftingSystemJson.id,
            embedded: craftingSystemJson.embedded,
            gameSystem: craftingSystemJson.gameSystem,
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