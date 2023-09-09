import {DefaultFabricateUserInterfaceAPI, FabricateUserInterfaceAPI} from "./FabricateUserInterfaceAPI";
import {CraftingSystemManagerAppFactory} from "../../applications/CraftingSystemManagerAppFactory";
import {DefaultComponentSalvageAppCatalog} from "../../applications/componentSalvageApp/ComponentSalvageAppCatalog";
import {DefaultComponentSalvageAppFactory} from "../../applications/componentSalvageApp/ComponentSalvageAppFactory";
import {DefaultRecipeCraftingAppCatalog} from "../../applications/recipeCraftingApp/RecipeCraftingAppCatalog";
import {DefaultRecipeCraftingAppFactory} from "../../applications/recipeCraftingApp/RecipeCraftingAppFactory";
import {FabricateAPI} from "./FabricateAPI";
import {DefaultLocalizationService} from "../../applications/common/LocalizationService";
import {DefaultGameProvider, GameProvider} from "../foundry/GameProvider";

interface FabricateUserInterfaceAPIFactory {

    make(): FabricateUserInterfaceAPI;
}

export { FabricateUserInterfaceAPIFactory };

class DefaultFabricateUserInterfaceAPIFactory implements FabricateUserInterfaceAPIFactory {

    private readonly fabricateAPI: FabricateAPI;
    private readonly gameProvider: GameProvider;

    constructor({
        fabricateAPI,
        gameProvider = new DefaultGameProvider(),
    }: {
        fabricateAPI: FabricateAPI;
        gameProvider?: GameProvider;
    }) {
        this.fabricateAPI = fabricateAPI;
        this.gameProvider = gameProvider;
    }

    make(): FabricateUserInterfaceAPI {

        const localizationService = new DefaultLocalizationService(this.gameProvider);

        const craftingSystemManagerAppFactory = new CraftingSystemManagerAppFactory({
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
            craftingSystemManagerAppFactory,
            componentSalvageAppCatalog,
            recipeCraftingAppCatalog,
            fabricateAPI: this.fabricateAPI,
            gameProvider: this.gameProvider,
        });
    }

}

export { DefaultFabricateUserInterfaceAPIFactory };