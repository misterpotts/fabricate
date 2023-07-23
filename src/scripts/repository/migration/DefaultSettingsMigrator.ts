import {SettingsMigrator} from "./SettingsMigrator";
import {SettingMigrationStep} from "./SettingMigrationStep";
import {SettingVersion} from "./SettingVersion";
import {SettingMigrationResult} from "../../api/SettingMigrationResult";
import {SettingManager} from "../SettingManager";
import Properties from "../../Properties";
import {SettingMigrationStatus} from "./SettingMigrationStatus";

class DefaultSettingsMigrator implements SettingsMigrator {

    /**
     * The default model version for Fabricate settings is V2. This is the version that was used prior to the introduction
     *   of the global settings property used by the SettingsMigrator.
     *
     * @private
     */
    private static readonly DEFAULT_MODEL_VERSION = SettingVersion.V2;

    private readonly _targetVersion: SettingVersion;
    private readonly _stepsBySourceVersion: Map<SettingVersion, SettingMigrationStep>;
    private readonly _versionSettingManager: SettingManager<string>;

    constructor({
        targetVersion = Properties.settings.modelVersion.targetValue,
        stepsBySourceVersion,
        versionSettingManager
    }: {
        targetVersion: SettingVersion;
        stepsBySourceVersion: Map<SettingVersion, SettingMigrationStep>;
        versionSettingManager: SettingManager<string>;
    }) {
        this._targetVersion = targetVersion;
        this._stepsBySourceVersion = stepsBySourceVersion;
        this._versionSettingManager = versionSettingManager;
    }

    async getModelVersion(): Promise<SettingVersion> {
        try {
            const versionSetting = await this._versionSettingManager.read();
            return SettingVersion.fromString(versionSetting);
        } catch (e: any) {
            const error = e instanceof Error ? e : new Error(e);
            console.warn(`Unable to read model version from settings, caused by "${error.message}". Using default version.`);
            return DefaultSettingsMigrator.DEFAULT_MODEL_VERSION;
        }
    }

    async isMigrationNeeded(): Promise<boolean> {
        const currentVersion = await this.getModelVersion();
        return this._targetVersion !== currentVersion;
    }

    get targetVersion(): SettingVersion {
        return this._targetVersion;
    }

    async performMigration(): Promise<SettingMigrationResult> {
        const doMigration = await this.isMigrationNeeded();
        if (!doMigration) {
            return {
                to: this._targetVersion,
                from: this._targetVersion,
                status: SettingMigrationStatus.NOT_NEEDED,
            }
        }

        let currentVersion = await this.getModelVersion();
        const initialVersion = currentVersion;

        while (await this.isMigrationNeeded()) {
            const migrationStep = this._stepsBySourceVersion.get(currentVersion);
            if (!migrationStep) {
                throw new Error(`No migration step found for version ${currentVersion}.`);
            }
            await migrationStep.perform();
            currentVersion = await this.getModelVersion();
        }

        return {
            to: this._targetVersion,
            from: initialVersion,
            status: SettingMigrationStatus.SUCCESS,
        }
    }

}

export { DefaultSettingsMigrator }