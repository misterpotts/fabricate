import {DefaultPatreonAPI, FabricatePatreonAPI} from "./FabricatePatreonAPI";
import {PatreonFeature} from "./PatreonFeature";
import {DefaultSettingManager, SettingManager} from "../repository/SettingManager";
import {DefaultHashProvider, HashProvider} from "./HashProvider";
import Properties from "../Properties";

interface PatreonAPIFactory {

    make(patreonFeatures: PatreonFeature[]): FabricatePatreonAPI;

}

export { PatreonAPIFactory };

class DefaultFabricatePatreonAPIFactory implements PatreonAPIFactory {

    private readonly _hashProvider: HashProvider;
    private readonly _clientSettings: ClientSettings;

    constructor({
        hashProvider = new DefaultHashProvider(),
        clientSettings,
    }: {
        hashProvider?: HashProvider;
        clientSettings: ClientSettings;
    }) {
        this._hashProvider = hashProvider;
        this._clientSettings = clientSettings;
    }

    make(patreonFeatures: PatreonFeature[]): FabricatePatreonAPI {

        const secretKeySettingManager: SettingManager<string> = new DefaultSettingManager({
            moduleId: Properties.module.id,
            settingKey: Properties.settings.patreon.secretKey.key,
            clientSettings: this._clientSettings
        });

        const patreonFeaturesById = patreonFeatures.reduce((map, feature) => {
            map.set(feature.id, feature);
            return map;
        }, new Map<string, PatreonFeature>);

        return new DefaultPatreonAPI({
            secretKeySettingManager,
            hashProvider: this._hashProvider,
            patreonFeaturesById,
        });

    }
}

export { DefaultFabricatePatreonAPIFactory }