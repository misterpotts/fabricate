import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "../api/EntityValidator";
import {CraftingSystem, CraftingSystemJson} from "./CraftingSystem";

class CraftingSystemValidator implements EntityValidator<CraftingSystemJson, CraftingSystem> {

    async validate(entity: CraftingSystem): Promise<EntityValidationResult<CraftingSystem>> {

        const validationResult = await this.validateJson(entity.toJson());
        return new DefaultEntityValidationResult({entity, errors: validationResult.errors});

    }

    async validateJson(entity: CraftingSystemJson): Promise<EntityValidationResult<CraftingSystemJson>> {

        const errors: string[] = [];

        if (!entity) {
            throw new Error(`Cannot validate crafting system. Candidate is ${typeof entity} `);
        }

        if (!entity.details?.name) {
            errors.push("Crafting system name is required");
        }

        if (!entity.details?.summary) {
            errors.push("Crafting system summary is required");
        }

        if (!entity.details?.author) {
            errors.push("Crafting system author is required");
        }

        return new DefaultEntityValidationResult({entity, errors});

    }

}

export {CraftingSystemValidator};