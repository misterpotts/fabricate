import {ObjectUtility} from "../../src/scripts/foundry/ObjectUtility";
import * as _ from "lodash";

class StubObjectUtility implements ObjectUtility {

    duplicate<T extends {}>(source: T): T {
        return _.cloneDeep(source);
    }

    merge<T extends object>(target: T, source: T): T {
        return _.merge(target, source);
    }

}

export { StubObjectUtility }