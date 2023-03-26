import {CraftingSystemData} from "./CraftingSystemApi";
import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "./EntityValidator";

class CraftingSystemSettingValidator implements EntityValidator<CraftingSystemData>{

    validate(value: CraftingSystemData): EntityValidationResult<CraftingSystemData> {

        const errors: string[] = [];

        if (!value) {
            errors.push("The Crafting system setting value must be an object. ");
        }

        if (!value.systemsById) {
            errors.push("The Crafting system setting must have the \"systemsById\" property. ");
        }

        return new DefaultEntityValidationResult({ entity: value, errors });

    }

}

export { CraftingSystemSettingValidator }