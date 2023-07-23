import {SettingMigrationStatus} from "../repository/migration/SettingMigrationStatus";
import {SettingVersion} from "../repository/migration/SettingVersion";

/**
 * The result of a setting migration.
 */
interface SettingMigrationResult {

    /**
     * The status of the migration.
     */
    status: SettingMigrationStatus;

    /**
     * The version the settings were migrated from.
     */
    from: SettingVersion;

    /**
     * The version the settings were migrated to.
     */
    to: SettingVersion;

}

export {SettingMigrationResult};