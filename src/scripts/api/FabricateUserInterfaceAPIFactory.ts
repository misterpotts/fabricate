import {DefaultFabricateUserInterfaceAPI, FabricateUserInterfaceAPI} from "./FabricateUserInterfaceAPI";
import {CraftingSystemManagerAppFactory} from "../../applications/CraftingSystemManagerAppFactory";
import {DefaultComponentSalvageAppCatalog} from "../../applications/componentSalvageApp/ComponentSalvageAppCatalog";
import {DefaultComponentSalvageAppFactory} from "../../applications/componentSalvageApp/ComponentSalvageAppFactory";
import {DefaultRecipeCraftingAppCatalog} from "../../applications/recipeCraftingApp/RecipeCraftingAppCatalog";
import {DefaultRecipeCraftingAppFactory} from "../../applications/recipeCraftingApp/RecipeCraftingAppFactory";
import {FabricateAPI} from "./FabricateAPI";
import {DefaultLocalizationService} from "../../applications/common/LocalizationService";
import {DefaultNotificationService} from "../foundry/NotificationService";
import {DefaultUIProvider, UIProvider} from "../foundry/UIProvider";
import {DefaultGameProvider, GameProvider} from "../foundry/GameProvider";

interface FabricateUserInterfaceAPIFactory {

    make(): FabricateUserInterfaceAPI;
}

export { FabricateUserInterfaceAPIFactory };

class DefaultFabricateUserInterfaceAPIFactory implements FabricateUserInterfaceAPIFactory {

    private readonly fabricateAPI: FabricateAPI;
    private readonly uiProvider: UIProvider;
    private readonly gameProvider: GameProvider;

    constructor({
        fabricateAPI,
        uiProvider = new DefaultUIProvider(),
        gameProvider = new DefaultGameProvider(),
    }: {
        fabricateAPI: FabricateAPI;
        uiProvider?: UIProvider;
        gameProvider?: GameProvider;
    }) {
        this.fabricateAPI = fabricateAPI;
        this.uiProvider = uiProvider;
        this.gameProvider = gameProvider;
    }

    make(): FabricateUserInterfaceAPI {

        const localizationService = new DefaultLocalizationService(this.gameProvider);

        const craftingSystemManagerAppFactory = new CraftingSystemManagerAppFactory({
            fabricateAPI: this.fabricateAPI,
            localizationService
        });

        const componentSalvageAppCatalog = new DefaultComponentSalvageAppCatalog({
            componentSalvageAppFactory: new DefaultComponentSalvageAppFactory(),
            fabricateAPI: this.fabricateAPI
        });

        const recipeCraftingAppCatalog = new DefaultRecipeCraftingAppCatalog({
            recipeCraftingAppFactory: new DefaultRecipeCraftingAppFactory(),
            fabricateAPI: this.fabricateAPI
        });

        return new DefaultFabricateUserInterfaceAPI({
            notificationService: new DefaultNotificationService(this.uiProvider),
            localizationService,
            craftingSystemManagerAppFactory,
            componentSalvageAppCatalog,
            recipeCraftingAppCatalog
        });
    }

}

export { DefaultFabricateUserInterfaceAPIFactory };