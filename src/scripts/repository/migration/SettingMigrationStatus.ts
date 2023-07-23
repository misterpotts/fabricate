/**
 * The status of a setting migration.
 */
enum SettingMigrationStatus {

    /**
     * The migration was successful. Your settings are now up-to-date.
     */
    SUCCESS,

    /**
     * The migration failed. Your settings may be in an invalid state.
     */
    FAILURE,

    /**
     * The migration was not necessary. The current version is the same as the target version.
     */
    NOT_NEEDED,

}

export { SettingMigrationStatus };