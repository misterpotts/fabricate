/**
 * The possible versions of Fabricate Settings
 */
enum SettingVersion {
    V2 = "V2",
    V3 = "V3",
}

namespace SettingVersion {

    export function fromString(value: string): SettingVersion {
        if (!value) {
            throw new Error("Cannot convert null or undefined to SettingVersion");
        }
        if (value === "V2") {
            return SettingVersion.V2;
        }
        if (value === "V3") {
            return SettingVersion.V3;
        }
        throw new Error(`Unknown SettingVersion: ${value}`);
    }

    export function toString(value: SettingVersion): string {
        switch (value) {
            case SettingVersion.V2:
                return "V2";
            case SettingVersion.V3:
                return "V3";
            default:
                throw new Error(`Unknown SettingVersion: ${value}`);
        }
    }

}

export { SettingVersion };