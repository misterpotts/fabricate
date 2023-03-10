import {GameProvider} from "../../scripts/foundry/GameProvider";

interface LocalizationService {

    localizeAll(basePath: string, childPaths: string[], lineBreak: boolean): string;

    localize(path: string): any;

    format(path: string, params: {}): any;

}

const localizationKey = Symbol();

class DefaultLocalizationService implements LocalizationService {

    private readonly _gameProvider: GameProvider;

    constructor(gameProvider: GameProvider) {
        this._gameProvider = gameProvider;
    }

    localizeAll(basePath: string, childPaths: string[], lineBreak = true) {
        if (!childPaths) {
            return "";
        }
        const localization = this._gameProvider.globalGameObject().i18n;
        return childPaths
            .map(childPath => localization.localize(`${basePath}.${childPath}`))
            .join(lineBreak ? "\n" : ", ");
    }

    localize(path: string) {
        const localization = this._gameProvider.globalGameObject().i18n;
        return localization.localize(path);
    }

    format(path: string, params: {} = {}) {
        const localization = this._gameProvider.globalGameObject().i18n;
        return localization.format(path, params);
    }

}


export { LocalizationService, DefaultLocalizationService, localizationKey }