import {PartDictionary} from "./PartDictionary";
import {EssenceDefinition} from "../common/EssenceDefinition";
import {CompendiumProvider} from "../foundry/CompendiumProvider";
import {CraftingComponent} from "../common/CraftingComponent";
import Properties from "../../Properties";
import {Recipe} from "../crafting/Recipe";
import {FabricateCompendiumData, FabricateItemType} from "../compendium/CompendiumData";
import {Combination, Unit} from "../common/Combination";

class CompendiumImporter {
    private readonly _compendiumProvider: CompendiumProvider;

    constructor(compendiumProvider: CompendiumProvider) {
        this._compendiumProvider = compendiumProvider;
    }

    public async import(compendiumPackKeys: string[], essenceDefinitions?: EssenceDefinition[]): Promise<PartDictionary> {
        const compendiums: Compendium[] = compendiumPackKeys.map((packKey: string) => this._compendiumProvider.getCompendium(packKey));
        const essencesBySlug: Map<string, EssenceDefinition> = essenceDefinitions ? new Map(essenceDefinitions.map((essence: EssenceDefinition) => [essence.slug, essence] as [string, EssenceDefinition])) : new Map();
        const partialPartDictionaries: PartDictionary[] = [];
        for (const compendium of compendiums) {
            const partDictionary: PartDictionary = await this.importCompendiumContents(compendium, essencesBySlug);
            partialPartDictionaries.push(partDictionary);
        }
        return this.rationaliseAndPopulateReferences(partialPartDictionaries);
    }

    private async importCompendiumContents(compendium: Compendium, essencesBySlug: Map<string, EssenceDefinition>): Promise<PartDictionary> {
        if (!Properties.module.compendiums.supportedTypes.includes(compendium.entity)) {
            throw new Error(`Compendium ${compendium.collection} has an unsupported Entity type: ${compendium.entity}. Supported Compendium Entity types are: ${Properties.module.compendiums.supportedTypes}. `);
        }
        const partDictionary: PartDictionary = new PartDictionary();
        const content: Item[] = await this.loadCompendiumContent<Item>(compendium, 10);
        content.forEach((item: Item) => {
            if (!('fabricate' in item.data.flags)) {
                return;
            }
            const itemConfig: FabricateCompendiumData = <FabricateCompendiumData>item.data.flags.fabricate;
            switch (itemConfig.type) {
                case FabricateItemType.COMPONENT:
                    const component: CraftingComponent = CraftingComponent.builder()
                        .withName(item.name)
                        .withImageUrl(item.img)
                        .withPartId(itemConfig.identity.partId)
                        .withCompendiumId(itemConfig.identity.systemId)
                        .withSalvage(this.partialComponentsFromCompendiumData(itemConfig.component.salvage, compendium.collection))
                        .withEssences(this.essencesFromCompendiumData(itemConfig.component.essences, essencesBySlug))
                        .build();
                    partDictionary.addComponent(component);
                    break;
                case FabricateItemType.RECIPE:
                    const recipe: Recipe = Recipe.builder()
                        .withName(item.name)
                        .withImageUrl(item.img)
                        .withPartId(itemConfig.identity.partId)
                        .withCompendiumId(itemConfig.identity.systemId)
                        .withIngredients(this.partialComponentsFromCompendiumData(itemConfig.recipe.ingredients, compendium.collection))
                        .withCatalysts(this.partialComponentsFromCompendiumData(itemConfig.recipe.catalysts, compendium.collection))
                        .withResults(this.partialComponentsFromCompendiumData(itemConfig.recipe.results, compendium.collection))
                        .withEssences(this.essencesFromCompendiumData(itemConfig.recipe.essences, essencesBySlug))
                        .build();
                    partDictionary.addRecipe(recipe);
                    break;
                default:
                    throw new Error(`${Properties.module.label} | Unable to load item ${item.id}. Could not determine Fabricate Entity Type. `);
            }
        });
        return partDictionary;
    }

    private rationaliseAndPopulateReferences(partDictionaries: PartDictionary[]): PartDictionary {
        const allComponents: CraftingComponent[] = partDictionaries.map((partDictionary: PartDictionary) => partDictionary.getComponents())
            .reduce((left: CraftingComponent[], right: CraftingComponent[]) => left.concat(right), []);
        const componentsById: Map<string, CraftingComponent> = new Map();
        for (const component of allComponents) {
            if (componentsById.has(component.id)) {
                throw new Error(`Component ${component.id} does not have a unique Part ID and Compendium ID. `);
            }
            componentsById.set(component.id, component);
        }
        allComponents.filter((component: CraftingComponent) => this.hasReferences(component))
            .map((component: CraftingComponent) => this.populateComponentReferences(component, componentsById))
            .forEach((component: CraftingComponent) => componentsById.set(component.id, component));
        const allRecipesPopulated: Recipe[] = partDictionaries.map((partDictionary: PartDictionary) => partDictionary.getRecipes())
            .reduce((left: Recipe[], right: Recipe[]) => left.concat(right), [])
            .map((recipe: Recipe) => this.populateRecipeReferences(recipe, componentsById));
        const recipesById: Map<string, Recipe> = new Map(allRecipesPopulated.map((recipe:Recipe) => [recipe.id, recipe] as [string, Recipe]));
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
    private async loadCompendiumContent<T extends Entity>(compendium: Compendium, maxAttempts: number): Promise<T[]> {
        let content: Entity[] = await compendium.getContent();
        let attempts: number = 0;
        while ((!content || (content.length === 0)) && (attempts <= maxAttempts)) {
            console.log(`${Properties.module.label} | Waiting for content in Compendium Pack ${compendium.collection} (Attempt ${attempts} of ${maxAttempts}. `);
            await this.wait(1000);
            attempts++;
            content = await compendium.getContent();
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
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    private essencesFromCompendiumData(essenceRecord: Record<string, number>, essenceDefinitions: Map<string, EssenceDefinition>): Combination<EssenceDefinition> {
        if (!essenceRecord) {
            return Combination.EMPTY();
        }
        const essenceSlugs: string[] = Object.keys(essenceRecord);
        if (essenceSlugs.length === 0) {
            return Combination.EMPTY();
        }
        const essenceUnits: Unit<EssenceDefinition>[] = essenceSlugs.map((slug: string) => {
            const essence: EssenceDefinition = essenceDefinitions.get(slug);
            const amount: number = essenceRecord[slug];
            return new Unit<EssenceDefinition>(essence, amount);
        });
        return Combination.ofUnits(essenceUnits);
    }

    private partialComponentsFromCompendiumData(componentRecord: Record<string, number>, packKey: string): Combination<CraftingComponent> {
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
                .build();
            const amount: number = componentRecord[partId];
            return new Unit<CraftingComponent>(component, amount);
        });
        return Combination.ofUnits(componentUnits);
    }


    private populateComponentReferences(component: CraftingComponent, componentsById: Map<string, CraftingComponent>): CraftingComponent {
        return component.toBuilder()
            .withSalvage(this.populateCombination(component.salvage, componentsById))
            .build();
    }

    private populateRecipeReferences(recipe: Recipe, componentsById: Map<string, CraftingComponent>): Recipe {
        return recipe.toBuilder()
            .withIngredients(this.populateCombination(recipe.ingredients, componentsById))
            .withCatalysts(this.populateCombination(recipe.catalysts, componentsById))
            .withResults(this.populateCombination(recipe.results, componentsById))
            .build();
    }

    private populateCombination(combination: Combination<CraftingComponent>, componentsById: Map<string, CraftingComponent>): Combination<CraftingComponent> {
        if (combination.isEmpty()) {
            return Combination.EMPTY();
        }
        const populatedUnits: Unit<CraftingComponent>[] = combination.units
            .map((unit: Unit<CraftingComponent>) => new Unit(componentsById.get(unit.part.id), unit.quantity));
        return Combination.ofUnits(populatedUnits)
    }
}

export {CompendiumImporter}