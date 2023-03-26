import {LocalizationService} from "../../../src/applications/common/LocalizationService";

class StubLocalizationService implements LocalizationService {

    private readonly _invocations: { path: string, params: {} }[] = [];

    format(path: string, params: {}): string {
        this._invocations.push({ path, params });
        return "Stub localization";
    }

    localize(path: string): string {
        this._invocations.push({ path, params: {} });
        return "Stub localization";
    }

    localizeAll(basePath: string, childPaths: string[], lineBreak: boolean): string {
        return childPaths.map(childPath => `${basePath}.${childPath}`)
            .map(value => this.localize(value))
            .join(lineBreak ? "\n" : ", ");
    }

    get invocations(): { path: string; params: {} }[] {
        return Array.from(this._invocations);
    }

}

export { StubLocalizationService }