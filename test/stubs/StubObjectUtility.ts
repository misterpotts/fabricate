import {ObjectUtility} from "../../src/scripts/foundry/ObjectUtility";
import * as _ from "lodash";

class StubObjectUtility implements ObjectUtility {

    duplicate<T extends {}>(source: T): T {
        return _.cloneDeep(source);
    }

    merge<T extends object>(target: T, source: T): T {
        return _.merge(target, source);
    }

    getPropertyValue<T>(propertyPath: string, object: object): T {
        if (!_.has(object, propertyPath)) {
            throw new Error(`Property path ${propertyPath} not found on object`);
        }
        return _.get(object, propertyPath);
    }

    setPropertyValue<T>(propertyPath: string, object: object, value: T): void {
        if (!_.has(object, propertyPath)) {
            throw new Error(`Property path ${propertyPath} not found on object`);
        }
        _.set(object, propertyPath, value);
    }

}

export { StubObjectUtility }