import { PartDictionary } from './PartDictionary';
import { EssenceDefinition } from '../common/EssenceDefinition';
import { CompendiumProvider } from '../foundry/CompendiumProvider';
import { CraftingComponent } from '../common/CraftingComponent';
import { Recipe } from '../crafting/Recipe';
import { FabricateCompendiumData, FabricateItemType } from '../compendium/CompendiumData';
import { Combination, Unit } from '../common/Combination';
import { CraftingSystemSpecification } from './CraftingSystemSpecification';
import Properties from '../Properties';
import { CompendiumEntryImportError } from '../error/CompendiumEntryImportError';
import { CompendiumEntryReferencePopulationError } from '../error/CompendiumEntryReferencePopulationError';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import { BaseItem } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs';

class CompendiumImporter {
  private readonly _compendiumProvider: CompendiumProvider;

  constructor(compendiumProvider: CompendiumProvider) {
    this._compendiumProvider = compendiumProvider;
  }

  public async import(craftingSystemSpecification: CraftingSystemSpecification): Promise<PartDictionary> {
    const compendiumPackKeys: string[] = craftingSystemSpecification.compendiumPacks;
    const essenceDefinitions: EssenceDefinition[] = craftingSystemSpecification.essences;
    const compendiums = <CompendiumCollection<any>[]>(
      compendiumPackKeys.map((packKey: string) => this._compendiumProvider.getCompendium(packKey))
    );
    const essencesBySlug: Map<string, EssenceDefinition> = essenceDefinitions
      ? new Map(
          essenceDefinitions.map(
            (essence: EssenceDefinition) => [essence.slug, essence] as [string, EssenceDefinition],
          ),
        )
      : new Map();
    const partialPartDictionaries: PartDictionary[] = [];
    for (const compendium of compendiums) {
      const partDictionary: PartDictionary = await this.importCompendiumContents(
        craftingSystemSpecification.id,
        compendium,
        essencesBySlug,
      );
      partialPartDictionaries.push(partDictionary);
    }
    return this.rationaliseAndPopulateReferences(partialPartDictionaries);
  }

  private async importCompendiumContents(
    systemId: string,
    compendium: CompendiumCollection<any>,
    essencesBySlug: Map<string, EssenceDefinition>,
  ): Promise<PartDictionary> {
    if (!Properties.module.compendiums.supportedTypes.includes(compendium.documentClass.documentName)) {
      // compendium.entity
      throw new Error(
        `Compendium ${compendium.collection} has an unsupported Entity type: ${compendium.documentClass.documentName}. Supported Compendium Entity types are: ${Properties.module.compendiums.supportedTypes}. `, // compendium.entity
      );
    }
    const partDictionary: PartDictionary = new PartDictionary();
    const content = <Item[]>await this.loadCompendiumContent<any>(compendium, 10);
    content.forEach((item: Item) => {
      if (!('fabricate' in item.data.flags)) {
        return;
      }
      const fabricateCompendiumData: FabricateCompendiumData = <FabricateCompendiumData>item.data.flags.fabricate;
      switch (fabricateCompendiumData.type) {
        case FabricateItemType.COMPONENT:
          const component: CraftingComponent = this.getComponent(
            item,
            fabricateCompendiumData,
            compendium,
            systemId,
            essencesBySlug,
          );
          partDictionary.addComponent(component);
          break;
        case FabricateItemType.RECIPE:
          const recipe: Recipe = this.getRecipe(item, fabricateCompendiumData, compendium, systemId, essencesBySlug);
          partDictionary.addRecipe(recipe);
          break;
        default:
          throw new Error(
            `${Properties.module.label} | Unable to load item ${item.id}. Could not determine Fabricate Entity Type. `,
          );
      }
    });
    return partDictionary;
  }

  private getRecipe(
    item: Item,
    fabricateCompendiumData: FabricateCompendiumData,
    compendium: CompendiumCollection<any>,
    systemId: string,
    essencesBySlug: Map<string, EssenceDefinition>,
  ) {
    try {
      return Recipe.builder()
        .withName(<string>item.name)
        .withImageUrl(<string>item.img)
        .withPartId(fabricateCompendiumData.identity.partId)
        .withCompendiumId(compendium.collection)
        .withSystemId(systemId)
        .withIngredients(
          this.partialComponentsFromCompendiumData(
            <Record<string, number>>fabricateCompendiumData.recipe?.ingredients,
            compendium.collection,
            systemId,
          ),
        )
        .withCatalysts(
          this.partialComponentsFromCompendiumData(
            <Record<string, number>>fabricateCompendiumData.recipe?.catalysts,
            compendium.collection,
            systemId,
          ),
        )
        .withResults(
          this.partialComponentsFromCompendiumData(
            <Record<string, number>>fabricateCompendiumData.recipe?.results,
            compendium.collection,
            systemId,
          ),
        )
        .withEssences(
          this.essencesFromCompendiumData(
            <Record<string, number>>fabricateCompendiumData.recipe?.essences,
            essencesBySlug,
          ),
        )
        .build();
    } catch (error) {
      throw new CompendiumEntryImportError(
        compendium.collection,
        <string>item.id,
        fabricateCompendiumData,
        systemId,
        error,
      );
    }
  }

  private getComponent(
    item: Item,
    fabricateCompendiumData: FabricateCompendiumData,
    compendium: CompendiumCollection<any>,
    systemId: string,
    essencesBySlug: Map<string, EssenceDefinition>,
  ) {
    try {
      return CraftingComponent.builder()
        .withName(<string>item.name)
        .withImageUrl(<string>item.img)
        .withPartId(fabricateCompendiumData.identity.partId)
        .withCompendiumId(compendium.collection)
        .withSystemId(systemId)
        .withSalvage(
          this.partialComponentsFromCompendiumData(
            <Record<string, number>>fabricateCompendiumData.component?.salvage,
            compendium.collection,
            systemId,
          ),
        )
        .withEssences(
          this.essencesFromCompendiumData(
            <Record<string, number>>fabricateCompendiumData.component?.essences,
            essencesBySlug,
          ),
        )
        .build();
    } catch (error) {
      throw new CompendiumEntryImportError(
        compendium.collection,
        <string>item.id,
        fabricateCompendiumData,
        systemId,
        error,
      );
    }
  }

  private rationaliseAndPopulateReferences(partDictionaries: PartDictionary[]): PartDictionary {
    const allComponents: CraftingComponent[] = partDictionaries
      .map((partDictionary: PartDictionary) => partDictionary.getComponents())
      .reduce((left: CraftingComponent[], right: CraftingComponent[]) => left.concat(right), []);
    const componentsById: Map<string, CraftingComponent> = new Map();
    for (const component of allComponents) {
      if (componentsById.has(component.id)) {
        throw new Error(`Component ${component.id} does not have a unique Part ID and Compendium ID. `);
      }
      componentsById.set(component.id, component);
    }
    allComponents
      .filter((component: CraftingComponent) => this.hasReferences(component))
      .map((component: CraftingComponent) => this.populateComponentReferences(component, componentsById))
      .forEach((component: CraftingComponent) => componentsById.set(component.id, component));
    const allRecipesPopulated: Recipe[] = partDictionaries
      .map((partDictionary: PartDictionary) => partDictionary.getRecipes())
      .reduce((left: Recipe[], right: Recipe[]) => left.concat(right), [])
      .map((recipe: Recipe) => this.populateRecipeReferences(recipe, componentsById));
    const recipesById: Map<string, Recipe> = new Map(
      allRecipesPopulated.map((recipe: Recipe) => [recipe.id, recipe] as [string, Recipe]),
    );
    return new PartDictionary(componentsById, recipesById);
  }

  private hasReferences(component: CraftingComponent) {
    return !component.salvage.isEmpty();
  }

  /**
   * Fallback awaiter for loading compendium content, as this was observed to be unreliable during development after the
   * game 'ready' Hook was fired
   *
   * @param compendium The Compendium from which to reliably load the Content
   * @param maxAttempts The maximum number of times to attempt loading Compendium Content
   * */
  private async loadCompendiumContent<T extends Document>(
    compendium: CompendiumCollection<any>,
    maxAttempts: number,
  ): Promise<T[]> {
    let content: T[] = await compendium.getDocuments(); //await compendium.getContent();
    let attempts: number = 0;
    while (!content && attempts <= maxAttempts) {
      console.log(
        `${Properties.module.label} | Waiting for content in Compendium Pack ${compendium.collection} (Attempt ${attempts} of ${maxAttempts}. `,
      );
      await this.wait(1000);
      attempts++;
      content = await compendium.getDocuments(); // await compendium.getContent();
    }
    return <T[]>content;
  }

  /**
   * Simple async awaiter delay function
   *
   * @param delay The number of millis to wait before resolving
   * @return a promise that resolves once the delay period has elapsed
   * */
  private async wait(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private essencesFromCompendiumData(
    essenceRecord: Record<string, number>,
    essenceDefinitions: Map<string, EssenceDefinition>,
  ): Combination<EssenceDefinition> {
    if (!essenceRecord) {
      return Combination.EMPTY();
    }
    const essenceSlugs: string[] = Object.keys(essenceRecord);
    if (essenceSlugs.length === 0) {
      return Combination.EMPTY();
    }
    const essenceUnits: Unit<EssenceDefinition>[] = essenceSlugs.map((slug: string) => {
      if (!essenceDefinitions.has(slug)) {
        throw new Error(
          `Essence '${slug}' does not exist in the Crafting System Specification. The available Essences are ${Array.from(
            essenceDefinitions.values(),
          )
            .map((essence) => `'${essence.slug}'`)
            .join(', ')}`,
        );
      }
      const essence: EssenceDefinition = <EssenceDefinition>essenceDefinitions.get(slug);
      const amount: number = essenceRecord[slug];
      return new Unit<EssenceDefinition>(essence, amount);
    });
    return Combination.ofUnits(essenceUnits);
  }

  private partialComponentsFromCompendiumData(
    componentRecord: Record<string, number>,
    packKey: string,
    systemId: string,
  ): Combination<CraftingComponent> {
    if (!componentRecord) {
      return Combination.EMPTY();
    }
    const componentIds: string[] = Object.keys(componentRecord);
    if (componentIds.length === 0) {
      return Combination.EMPTY();
    }
    const componentUnits: Unit<CraftingComponent>[] = componentIds.map((partId: string) => {
      const component: CraftingComponent = CraftingComponent.builder()
        .withPartId(partId)
        .withCompendiumId(packKey)
        .withSystemId(systemId)
        .build();
      const amount: number = componentRecord[partId];
      return new Unit<CraftingComponent>(component, amount);
    });
    return Combination.ofUnits(componentUnits);
  }

  private populateComponentReferences(
    component: CraftingComponent,
    componentsById: Map<string, CraftingComponent>,
  ): CraftingComponent {
    try {
      return component.toBuilder().withSalvage(this.populateCombination(component.salvage, componentsById)).build();
    } catch (error) {
      throw new CompendiumEntryReferencePopulationError(component, error);
    }
  }

  private populateRecipeReferences(recipe: Recipe, componentsById: Map<string, CraftingComponent>): Recipe {
    try {
      return recipe
        .toBuilder()
        .withIngredients(this.populateCombination(recipe.ingredients, componentsById))
        .withCatalysts(this.populateCombination(recipe.catalysts, componentsById))
        .withResults(this.populateCombination(recipe.results, componentsById))
        .build();
    } catch (error) {
      throw new CompendiumEntryReferencePopulationError(recipe, error);
    }
  }

  private populateCombination(
    combination: Combination<CraftingComponent>,
    componentsById: Map<string, CraftingComponent>,
  ): Combination<CraftingComponent> {
    if (combination.isEmpty()) {
      return Combination.EMPTY();
    }
    const populatedUnits: Unit<CraftingComponent>[] = <Unit<CraftingComponent>[]>combination.units.map(
      (unit: Unit<CraftingComponent>) => {
        if (componentsById.has(unit.part.id)) {
          return new Unit(<CraftingComponent>componentsById.get(unit.part.id), unit.quantity);
        }
        throw new Error(`Crafting Component '${unit.part.id}' does not exist. `);
      },
    );
    return Combination.ofUnits(populatedUnits);
  }
}

export { CompendiumImporter };
