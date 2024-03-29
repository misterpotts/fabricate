import {DefaultFabricateUserInterfaceAPI, FabricateUserInterfaceAPI} from "./FabricateUserInterfaceAPI";
import {CraftingSystemManagerAppFactory} from "../../applications/CraftingSystemManagerAppFactory";
import {DefaultComponentSalvageAppCatalog} from "../../applications/componentSalvageApp/ComponentSalvageAppCatalog";
import {DefaultComponentSalvageAppFactory} from "../../applications/componentSalvageApp/ComponentSalvageAppFactory";
import {DefaultRecipeCraftingAppCatalog} from "../../applications/recipeCraftingApp/RecipeCraftingAppCatalog";
import {DefaultRecipeCraftingAppFactory} from "../../applications/recipeCraftingApp/RecipeCraftingAppFactory";
import {FabricateAPI} from "./FabricateAPI";
import {DefaultLocalizationService} from "../../applications/common/LocalizationService";
import {DefaultGameProvider, GameProvider} from "../foundry/GameProvider";
import {FabricatePatreonAPI} from "../patreon/FabricatePatreonAPI";
import {DefaultActorCraftingAppFactory} from "../../applications/actorCraftingApp/ActorCraftingAppFactory";

interface FabricateUserInterfaceAPIFactory {

    make(): FabricateUserInterfaceAPI;
}

export { FabricateUserInterfaceAPIFactory };

class DefaultFabricateUserInterfaceAPIFactory implements FabricateUserInterfaceAPIFactory {

    private readonly fabricateAPI: FabricateAPI;
    private readonly gameProvider: GameProvider;
    private readonly fabricatePatreonAPI: FabricatePatreonAPI;

    constructor({
        fabricateAPI,
        gameProvider = new DefaultGameProvider(),
        fabricatePatreonAPI
    }: {
        fabricateAPI: FabricateAPI;
        gameProvider?: GameProvider;
        fabricatePatreonAPI: FabricatePatreonAPI;
    }) {
        this.fabricateAPI = fabricateAPI;
        this.gameProvider = gameProvider;
        this.fabricatePatreonAPI = fabricatePatreonAPI;
    }

    make(): FabricateUserInterfaceAPI {

        const localizationService = new DefaultLocalizationService(this.gameProvider);

        const craftingSystemManagerAppFactory = new CraftingSystemManagerAppFactory({
            fabricateAPI: this.fabricateAPI,
            localizationService
        });

        const actorCraftingAppFactory = new DefaultActorCraftingAppFactory({
            fabricateAPI: this.fabricateAPI,
            localizationService
        });

        const componentSalvageAppCatalog = new DefaultComponentSalvageAppCatalog({
            componentSalvageAppFactory: new DefaultComponentSalvageAppFactory({
                localizationService,
                craftingAPI: this.fabricateAPI.crafting,
                componentAPI: this.fabricateAPI.components,
            })
        });

        const recipeCraftingAppCatalog = new DefaultRecipeCraftingAppCatalog({
            recipeCraftingAppFactory: new DefaultRecipeCraftingAppFactory({
                craftingAPI: this.fabricateAPI.crafting,
                componentAPI: this.fabricateAPI.components,
                localizationService
            })
        });

        return new DefaultFabricateUserInterfaceAPI({
            actorCraftingAppFactory,
            recipeCraftingAppCatalog,
            componentSalvageAppCatalog,
            craftingSystemManagerAppFactory,
            fabricateAPI: this.fabricateAPI,
            gameProvider: this.gameProvider,
            fabricatePatreonAPI: this.fabricatePatreonAPI,
        });
    }

}

export { DefaultFabricateUserInterfaceAPIFactory };