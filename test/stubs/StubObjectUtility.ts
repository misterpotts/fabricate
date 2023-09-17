import {ObjectUtility} from "../../src/scripts/foundry/ObjectUtility";
import * as _ from "lodash";

class StubObjectUtility implements ObjectUtility {

    private readonly strict: boolean;

    constructor(isStrict = false) {
        this.strict = isStrict;
    }

    get isStrict(): boolean {
        return this.strict;
    }

    duplicate<T extends {}>(source: T): T {
        return _.cloneDeep(source);
    }

    merge<T extends object>(target: T, source: T): T {
        return _.merge(target, source);
    }

    getPropertyValue<T>(propertyPath: string, object: object): T {
        const pathExists = _.has(object, propertyPath);
        if (!pathExists && this.strict) {
            throw new Error(`Property path ${propertyPath} not found on object`);
        }
        return _.get(object, propertyPath, undefined);
    }

    setPropertyValue<T>(propertyPath: string, object: object, value: T): void {
        const pathExists = _.has(object, propertyPath);
        if (!pathExists && this.strict) {
            throw new Error(`Property path ${propertyPath} not found on object`);
        }
        _.set(object, propertyPath, value);
    }

}

export { StubObjectUtility }