import {PatreonFeature} from "./PatreonFeature";
import {SettingManager} from "../repository/SettingManager";
import {DefaultHashProvider, HashProvider} from "./HashProvider";

interface FabricatePatreonAPI {

    isEnabled(featureId: string): Promise<boolean>;

    listFeatures(): Promise<{ enabled: PatreonFeature[], disabled: PatreonFeature[] }>;

}

export { FabricatePatreonAPI };

class DefaultPatreonAPI implements FabricatePatreonAPI {

    private readonly _patreonFeaturesById: Map<string, PatreonFeature>;
    private readonly _secretKeySettingManager: SettingManager<string>;
    private readonly _hashProvider: HashProvider;

    constructor({
        hashProvider = new DefaultHashProvider(),
        secretKeySettingManager,
        patreonFeaturesById = new Map<string, PatreonFeature>(),
    }: {
        hashProvider?: HashProvider;
        secretKeySettingManager: SettingManager<string>;
        patreonFeaturesById?: Map<string, PatreonFeature>;
    }) {
        this._hashProvider = hashProvider;
        this._secretKeySettingManager = secretKeySettingManager;
        this._patreonFeaturesById = patreonFeaturesById;
    }

    async isEnabled(featureId: string): Promise<boolean> {
        const secretKey = await this._secretKeySettingManager.read();
        const target = await this._hashProvider.hash(secretKey);
        if (!this._patreonFeaturesById.has(featureId)) {
            return false;
        }
        return this._patreonFeaturesById
            .get(featureId)
            .includedIn(target);
    }

    async listFeatures(): Promise<{ enabled: PatreonFeature[], disabled: PatreonFeature[] }> {
        const secretKey = await this._secretKeySettingManager.read();
        const target = await this._hashProvider.hash(secretKey);
        return Array.from(this._patreonFeaturesById.values())
            .reduce((result, patreonFeature) => {
                if (patreonFeature.includedIn(target)) {
                    result.enabled.push(patreonFeature);
                } else {
                    result.disabled.push(patreonFeature);
                }
                return result;
            }, { enabled: [], disabled: [] });
    }

}

export { DefaultPatreonAPI }