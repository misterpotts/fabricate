import {SettingManager} from "../../../src/scripts/api/SettingManager";

class StubSettingManager<T> implements SettingManager<T>{

    private readonly initialValue: T;
    private value: T;

    constructor(value?: T) {
        this.value = value;
        this.initialValue = value;
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

    reset(): void {
        this.value = this.initialValue;
    }

}

export { StubSettingManager }