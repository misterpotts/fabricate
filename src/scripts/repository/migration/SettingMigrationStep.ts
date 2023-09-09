import {SettingVersion} from "./SettingVersion";

interface SettingMigrationStep {

    readonly from: SettingVersion;

    readonly to: SettingVersion;

    perform(): Promise<void>;

}

export { SettingMigrationStep }

