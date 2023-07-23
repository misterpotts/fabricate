import {CraftingSystem, CraftingSystemJson} from "./CraftingSystem";
import {CraftingSystemDetails} from "./CraftingSystemDetails";
import {EntityFactory} from "../repository/EntityFactory";

class CraftingSystemFactory implements EntityFactory<CraftingSystemJson, CraftingSystem> {

    public async make(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem> {

        return new CraftingSystem({
            id: craftingSystemJson.id,
            embedded: craftingSystemJson.embedded,
            gameSystem: craftingSystemJson.gameSystem,
            craftingSystemDetails: new CraftingSystemDetails({
                name: craftingSystemJson.details.name,
                summary: craftingSystemJson.details.summary,
                description: craftingSystemJson.details.description,
                author: craftingSystemJson.details.author,
            }),
            enabled: craftingSystemJson.enabled,
        });

    }

}

export {CraftingSystemFactory}