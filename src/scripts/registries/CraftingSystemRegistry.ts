import { CraftingSystem } from '../system/CraftingSystem';
import { Recipe } from '../crafting/Recipe';
import { CraftingComponent } from '../common/CraftingComponent';
import { CraftingSystemSpecification } from '../system/CraftingSystemSpecification';
import { AlchemistsSuppliesSystemSpec } from './system_definitions/AlchemistsSuppliesV16';

class CraftingSystemRegistry {
  private _craftingSystemsByCompendiumKey: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
  private _craftingSystemsByPartId: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
  private _systemSpecifications: CraftingSystemSpecification[] = CraftingSystemRegistry.systemSpecifications();

  public register(system: CraftingSystem): void {
    this._craftingSystemsByCompendiumKey.set(system.compendiumPackKey, system);
    this._craftingSystemsByPartId = this.resolvePartsForSystem(system, this._craftingSystemsByPartId);
  }

  private resolvePartsForSystem(
    system: CraftingSystem,
    parts: Map<string, CraftingSystem>,
  ): Map<string, CraftingSystem> {
    const recipeLinks: Map<string, CraftingSystem> = new Map(
      system.recipes.map((recipe: Recipe) => [recipe.partID extends Item, system]),
    );
    const componentLinks: Map<string, CraftingSystem> = new Map(
      system.components.map((component: CraftingComponent) => [component.partID extends Item, system]),
    );
    const systemParts: Map<string, CraftingSystem> = new Map([...recipeLinks, ...componentLinks]);
    if (systemParts.size !== recipeLinks.size + componentLinks.size) {
      throw new Error(`The Crafting System with ID ${system.compendiumPackKey} contains duplicate Part IDs. `);
    }
    const mergedParts: Map<string, CraftingSystem> = new Map([...parts, ...systemParts]);
    if (mergedParts.size !== systemParts.size + parts.size) {
      throw new Error(
        `The Crafting System with ID ${system.compendiumPackKey} shares ${
          systemParts.size + parts.size - mergedParts.size
        } Part IDs with already registered systems. `,
      );
    }
    return mergedParts;
  }

  public getSystemByCompendiumPackKey(id: string): CraftingSystem {
    if (this._craftingSystemsByCompendiumKey.has(id)) {
      return this._craftingSystemsByCompendiumKey.get(id);
    }
    throw new Error(`No Crafting system is registered with Fabricate for the Compendium Pack Key ${id}. `);
  }

  public getSystemByPartId(id: string): CraftingSystem {
    if (this._craftingSystemsByPartId.has(id)) {
      return this._craftingSystemsByPartId.get(id);
    }
    throw new Error(`No Crafting system is registered with Fabricate for the Recipe ${id}. `);
  }

  public getAllSystems(): CraftingSystem[] {
    return Array.from(this._craftingSystemsByCompendiumKey.values());
  }

  public get systemSpecifications(): CraftingSystemSpecification[] {
    return this._systemSpecifications;
  }

  public declareSpecification(spec: CraftingSystemSpecification): void {
    this._systemSpecifications.push(spec);
  }

  public static systemSpecifications(): CraftingSystemSpecification[] {
    const systemSpecifications: CraftingSystemSpecification[] = [];

    const testSystemSpec: CraftingSystemSpecification = CraftingSystemSpecification.builder()
      .withName("Child's Play")
      .withSummary('The test Crafting System for Fabricate')
      .withDescription('A simple tech demo used for the early development of Fabricate. ')
      .withCompendiumPack('fabricate.fabricate-test')
      .withSupportedGameSystem(GameSystem.DND5E)
      .build();
    systemSpecifications.push(testSystemSpec);

    systemSpecifications.push(AlchemistsSuppliesSystemSpec);

    return systemSpecifications;
  }
}

export { CraftingSystemRegistry };
