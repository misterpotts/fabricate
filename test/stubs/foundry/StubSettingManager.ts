import {SettingManager} from "../../../src/scripts/repository/SettingManager";
import {cloneDeep} from "lodash";

class StubSettingManager<T> implements SettingManager<T>{

    private readonly initialValue: T;
    private value: T;

    constructor(value?: T, initialValue?: T) {
        this.value = value;
        this.initialValue = initialValue ?? cloneDeep(value);
    }

    async delete(): Promise<T> {
        this.value = null;
        return;
    }

    async read(): Promise<T> {
        return this.value;
    }

    async write(value: T): Promise<void> {
        this.value = value
        return;
    }

    reset(value?: T): void {
        this.value = value ?? this.initialValue;
    }

    get settingPath(): string {
        return "stub.setting.path";
    }

    get settingKey(): string {
        return "stubKey";
    }

}

export { StubSettingManager }