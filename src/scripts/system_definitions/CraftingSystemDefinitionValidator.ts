import {CraftingSystemDefinition} from "./CraftingSystemDefinition";
import {GameSystem} from "../system/GameSystem";

class CraftingSystemDefinitionError {

    private readonly _detail: string;
    private readonly _propertyPath: string;

    constructor(detail: string, propertyPath: string = "$") {
        this._detail = detail;
        this._propertyPath = `$.${propertyPath}`;
    }

    get detail(): string {
        return this._detail;
    }

    get propertyPath(): string {
        return this._propertyPath;
    }

}

class CraftingSystemDefinitionValidator {

    static validate(systemDefinition: CraftingSystemDefinition): { isValid: boolean, errors: CraftingSystemDefinitionError[]} {

        if (!systemDefinition) {
            return {
                errors: [new CraftingSystemDefinitionError("The Crafting System Definition was null. ")],
                isValid: false
            }
        }

        const errors: CraftingSystemDefinitionError[] = [];

        if (!this.isNonEmptyString(systemDefinition.id)) {
            errors.push(new CraftingSystemDefinitionError("ID is required", "id"));
        }

        if (!this.isNonEmptyString(systemDefinition.name)) {
            errors.push(new CraftingSystemDefinitionError("Name is required", "name"));
        }

        if (!this.isNonEmptyString(systemDefinition.summary)) {
            errors.push(new CraftingSystemDefinitionError("Summary is required", "summary"));
        }

        if (!this.isNonEmptyString(systemDefinition.author)) {
            errors.push(new CraftingSystemDefinitionError("Author is required", "author"));
        }

        const allowedGameSystemValues = Object.values(GameSystem);
        if (!this.isStringInSet(systemDefinition.gameSystem, allowedGameSystemValues)) {
            errors.push(new CraftingSystemDefinitionError(`A valid Game System must be provided. Allowed values are "${allowedGameSystemValues.join(", ")}"`, "gameSystem"));
        }

        if (systemDefinition.enabled == null) {
            errors.push(new CraftingSystemDefinitionError("Enabled must be set to true or false", "enabled"));
        }

        if (systemDefinition.locked == null) {
            errors.push(new CraftingSystemDefinitionError("Locked must be set to true or false", "locked"));
        }

        if (systemDefinition.hasCraftingChecks == null) {
            errors.push(new CraftingSystemDefinitionError("Crafting check toggle must be set to true or false", "hasCraftingChecks"));
        }

        if (systemDefinition.essences == null) {
            errors.push(new CraftingSystemDefinitionError("Essences must be an array", "essences"));
        }

        if (systemDefinition.compendia == null) {
            errors.push(new CraftingSystemDefinitionError("Compendia must be an array", "compendia"));
        }

        return {
            errors,
            isValid: errors.length === 0
        }

    }

    static isNonEmptyString(value: string): boolean {
        return value && value.length > 0
    }

    static isStringInSet(value: string, strings: string[]) {
        if (!value) {
            return false;
        }
        return strings.indexOf(value) >= 0;
    }

}

export { CraftingSystemDefinitionValidator }