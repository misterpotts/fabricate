import { CraftingComponent } from '../common/CraftingComponent';
import Properties from '../Properties';
import { FabricateItem } from '../common/FabricateItem';
import { Recipe } from '../crafting/Recipe';
import { CompendiumEntry, FabricateItemType } from '../compendium/CompendiumData';

class PartDictionary {
  private readonly _components: Map<string, CraftingComponent> = new Map();
  private readonly _recipes: Map<string, Recipe> = new Map();

  constructor(components: Map<string, CraftingComponent> = new Map(), recipes: Map<string, Recipe> = new Map()) {
    this._components = components;
    this._recipes = recipes;
  }

  public static typeOf(item: Item): FabricateItemType | 'NONE' {
    const itemType: FabricateItemType = <FabricateItemType>(
      item.getFlag(Properties.module.name, Properties.flagKeys.item.fabricateItemType)
    );
    if (itemType) {
      return itemType;
    }
    return 'NONE';
  }

  private static validateType(item: Item, expectedType: FabricateItemType): void {
    if (PartDictionary.typeOf(item) !== expectedType) {
      const ownershipDescription: string = item.actor ? `owned by Actor '${item.actor.name}` : 'with no owning Actor';
      throw new Error(`Item '${item.id}', with name '${item.name}' ${ownershipDescription} is not a ${expectedType}! `);
    }
  }

  private static getIdentifier(item: Item): string {
    const identity: CompendiumEntry = <CompendiumEntry>(
      item.getFlag(Properties.module.name, Properties.flagKeys.item.identity)
    );
    return FabricateItem.globalIdentifier(identity.partID extends Item, identity.systemId);
  }

  public componentFrom(item: Item): CraftingComponent {
    PartDictionary.validateType(item, FabricateItemType.COMPONENT);
    const identifier: string = PartDictionary.getIdentifier(item);
    if (this._components.has(identifier)) {
      return this._components.get(identifier);
    }
    const ownershipDescription: string = item.actor ? `owned by Actor '${item.actor.name}` : 'with no owning Actor';
    throw new Error(
      `Unable to look up Fabricate System Part for Item '${item.id}', with name '${item.name}' ${ownershipDescription}. `,
    );
  }

  public recipeFrom(item: Item): Recipe {
    PartDictionary.validateType(item, FabricateItemType.RECIPE);
    const identifier: string = PartDictionary.getIdentifier(item);
    if (this._recipes.has(identifier)) {
      return this._recipes.get(identifier);
    }
    const ownershipDescription: string = item.actor ? `owned by Actor '${item.actor.name}` : 'with no owning Actor';
    throw new Error(
      `Unable to look up Fabricate System Part for Item '${item.id}', with name '${item.name}' ${ownershipDescription}. `,
    );
  }

  public addRecipe(recipe: Recipe): void {
    const globalIdentifier: string = FabricateItem.globalIdentifier(recipe.partID extends Item, recipe.systemId);
    this._recipes.set(globalIdentifier, recipe);
  }

  public addComponent(component: CraftingComponent): void {
    const globalIdentifier: string = FabricateItem.globalIdentifier(component.partID extends Item, component.systemId);
    this._components.set(globalIdentifier, component);
  }

  public getRecipe(partId: string, systemId: string): Recipe {
    const globalIdentifier: string = FabricateItem.globalIdentifier(partID extends Item, systemId);
    if (this._recipes.has(globalIdentifier)) {
      return this._recipes.get(globalIdentifier);
    }
    throw new Error(`No Recipe was found with the identifier ${globalIdentifier}. `);
  }

  public getComponent(partId: string, systemId: string): CraftingComponent {
    const globalIdentifier: string = FabricateItem.globalIdentifier(partID extends Item, systemId);
    if (this._components.has(globalIdentifier)) {
      return this._components.get(globalIdentifier);
    }
    throw new Error(`No Component was found with the identifier ${globalIdentifier}. `);
  }

  public size(): number {
    return this._recipes.size + this._components.size;
  }

  public getComponents(): CraftingComponent[] {
    const components: CraftingComponent[] = [];
    for (const component of this._components.values()) {
      components.push(component);
    }
    return components;
  }

  public getRecipes(): Recipe[] {
    const recipes: Recipe[] = [];
    for (const recipe of this._recipes.values()) {
      recipes.push(recipe);
    }
    return recipes;
  }
}

export { PartDictionary };
