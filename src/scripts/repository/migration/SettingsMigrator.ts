import {SettingVersion} from "./SettingVersion";
import {SettingMigrationResult} from "../../api/SettingMigrationResult";

interface SettingsMigrator {

    readonly targetVersion: SettingVersion;

    isMigrationNeeded(): Promise<boolean>;

    performMigration(): Promise<SettingMigrationResult>;

    getModelVersion(): Promise<SettingVersion>;

}

export { SettingsMigrator }