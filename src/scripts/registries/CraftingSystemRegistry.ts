import {CraftingSystem} from "../system/CraftingSystem";
import {Recipe} from "../crafting/Recipe";
import {CraftingComponent} from "../common/CraftingComponent";
import {CraftingSystemDefinition} from "../system_definitions/CraftingSystemDefinition";

import {SYSTEM_DEFINITION as ALCHEMISTS_SUPPLIES} from "../system_definitions/AlchemistsSuppliesV16";

class CraftingSystemRegistry {

    private _craftingSystemsById: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private _craftingSystemsByPartId: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private _systemDefinitions: CraftingSystemDefinition[] = CraftingSystemRegistry.defaultSystemSpecifications();

    public register(system: CraftingSystem): void {
        this._craftingSystemsById.set(system.id, system);
        this._craftingSystemsByPartId = this.resolvePartsForSystem(system, this._craftingSystemsByPartId);
    }

    private resolvePartsForSystem(system: CraftingSystem, parts: Map<string, CraftingSystem>): Map<string, CraftingSystem> {
        const recipeLinks: Map<string, CraftingSystem> = new Map(system.recipes.map((recipe: Recipe) => [recipe.partId, system]));
        const componentLinks: Map<string, CraftingSystem> = new Map(system.components.map((component: CraftingComponent) => [component.partId, system]));
        const systemParts: Map<string, CraftingSystem> = new Map([...recipeLinks, ...componentLinks]);
        if (systemParts.size !== (recipeLinks.size + componentLinks.size)) {
            throw new Error(`The Crafting System with ID ${system.id} contains duplicate Part IDs. `);
        }
        const mergedParts: Map<string, CraftingSystem> = new Map([...parts, ...systemParts]);
        if (mergedParts.size !== (systemParts.size + parts.size)) {
            throw new Error(`The Crafting System with ID ${system.id} shares ${(systemParts.size + parts.size) - mergedParts.size} Part IDs with already registered systems. `);
        }
        return mergedParts;
    }

    public getSystemById(id: string): CraftingSystem {
        if (this._craftingSystemsById.has(id)) {
            return this._craftingSystemsById.get(id);
        }
        throw new Error(`No Crafting system is registered with Fabricate for the Compendium Pack Key ${id}. `);
    }

    public getSystemByPartId(id: string): CraftingSystem {
        if (this._craftingSystemsByPartId.has(id)) {
            return this._craftingSystemsByPartId.get(id);
        }
        throw new Error(`No Crafting system is registered with Fabricate for the Component with ID: "${id}". `);
    }

    public getAllSystems(): CraftingSystem[] {
        return Array.from(this._craftingSystemsById.values());
    }

    public get systemDefinitions(): CraftingSystemDefinition[] {
        return this._systemDefinitions;
    }

    public define(craftingSystemDefinition: CraftingSystemDefinition): void {
        this._systemDefinitions.push(craftingSystemDefinition);
    }

    public static defaultSystemSpecifications(): CraftingSystemDefinition[] {
        const systemSpecifications: CraftingSystemDefinition[] = [];
        systemSpecifications.push(ALCHEMISTS_SUPPLIES);
        return systemSpecifications;
    }

}

export {CraftingSystemRegistry}