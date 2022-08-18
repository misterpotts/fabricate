import {PartDictionary} from "./PartDictionary";
import {EssenceDefinition, EssenceDefinitionConfig} from "../common/EssenceDefinition";
import {CompendiumProvider, DefaultCompendiumProvider} from "../compendium/CompendiumProvider";
import {CraftingComponent} from "../common/CraftingComponent";
import {Recipe} from "../crafting/Recipe";
import {FabricateCompendiumData, FabricateItemType} from "../compendium/CompendiumData";
import {Combination, Unit} from "../common/Combination";
import Properties from "../Properties";
import {CompendiumEntryImportError} from "../error/CompendiumEntryImportError";
import {CompendiumEntryReferencePopulationError} from "../error/CompendiumEntryReferencePopulationError";
import {
    DocumentInstanceForCompendiumMetadata
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/collections/compendium";

class CompendiumImporter {

    private readonly _compendiumProvider: CompendiumProvider;

    constructor(compendiumProvider?: CompendiumProvider) {
        this._compendiumProvider = compendiumProvider ? compendiumProvider : new DefaultCompendiumProvider();
    }

    public async import(systemId: string,
                        compendiumPackKeys: string[],
                        essenceDefinitions: EssenceDefinitionConfig[]): Promise<PartDictionary> {
        const compendiums: CompendiumCollection<CompendiumCollection.Metadata>[] = compendiumPackKeys.map((packKey: string) => this._compendiumProvider.getCompendium(packKey));
        const essencesBySlug: Map<string, EssenceDefinition> = essenceDefinitions ? new Map(essenceDefinitions.map((essence: EssenceDefinitionConfig) => [essence.slug, essence] as [string, EssenceDefinition])) : new Map();
        const partialPartDictionaries: PartDictionary[] = [];
        for (const compendium of compendiums) {
            const partDictionary: PartDictionary = await this.importCompendiumContents(systemId, compendium, essencesBySlug);
            partialPartDictionaries.push(partDictionary);
        }
        return this.rationaliseAndPopulateReferences(partialPartDictionaries);
    }

    private async importCompendiumContents(systemId: string,
                                           compendium:  CompendiumCollection<CompendiumCollection.Metadata>,
                                           essencesBySlug: Map<string, EssenceDefinition>): Promise<PartDictionary> {
        if (!Properties.module.compendiums.supportedTypes.includes(compendium.metadata.type)) {
            throw new Error(`Compendium ${compendium.collection} has an unsupported Document type: ${compendium.metadata.type}. Supported Compendium Document types are: ${Properties.module.compendiums.supportedTypes}. `);
        }
        const partDictionary: PartDictionary = new PartDictionary();
        const documents: StoredDocument<DocumentInstanceForCompendiumMetadata<CompendiumCollection.Metadata>>[] = await this.loadCompendiumContent(compendium, 10);
        documents.forEach((document: StoredDocument<DocumentInstanceForCompendiumMetadata<CompendiumCollection.Metadata>>) => {
            if (!('fabricate' in document.data.flags)) {
                return;
            }
            const fabricateCompendiumData: FabricateCompendiumData = <FabricateCompendiumData>document.data.flags.fabricate;
            switch (fabricateCompendiumData.type) {
                case FabricateItemType.COMPONENT:
                    const component: CraftingComponent = this.getComponent(document, fabricateCompendiumData, compendium, systemId, essencesBySlug);
                    partDictionary.addComponent(component);
                    break;
                case FabricateItemType.RECIPE:
                    const recipe: Recipe = this.getRecipe(document, fabricateCompendiumData, compendium, systemId, essencesBySlug);
                    partDictionary.addRecipe(recipe);
                    break;
                default:
                    throw new Error(`${Properties.module.label} | Unable to load item ${document.id}. Could not determine Fabricate Entity Type. `);
            }
        });
        return partDictionary;
    }

    private getRecipe(document: StoredDocument<DocumentInstanceForCompendiumMetadata<CompendiumCollection.Metadata>>,
                      fabricateCompendiumData: FabricateCompendiumData,
                      compendium: CompendiumCollection<CompendiumCollection.Metadata>,
                      systemId: string,
                      essencesBySlug: Map<string, EssenceDefinition>) {
        try {
            return new Recipe({
                item: {
                    partId: fabricateCompendiumData.identity.partId,
                    systemId: systemId,
                    compendiumId: compendium.collection,
                    name: document.name,
                    imageUrl: document.img
                },
                ingredients: this.partialComponentsFromCompendiumData(fabricateCompendiumData.recipe.ingredients, compendium.collection, systemId),
                catalysts: this.partialComponentsFromCompendiumData(fabricateCompendiumData.recipe.catalysts, compendium.collection, systemId),
                essences: this.essencesFromCompendiumData(fabricateCompendiumData.recipe.essences, essencesBySlug),
                results: this.partialComponentsFromCompendiumData(fabricateCompendiumData.recipe.results, compendium.collection, systemId)
            });
        } catch (error) {
            throw new CompendiumEntryImportError(compendium.collection, document.id, fabricateCompendiumData, systemId, error as Error);
        }

    }

    private getComponent(document: StoredDocument<DocumentInstanceForCompendiumMetadata<CompendiumCollection.Metadata>>,
                         fabricateCompendiumData: FabricateCompendiumData,
                         compendium: CompendiumCollection<CompendiumCollection.Metadata>,
                         systemId: string,
                         essencesBySlug: Map<string, EssenceDefinition>) {
        try {
            return new CraftingComponent({
                item: {
                    partId: fabricateCompendiumData.identity.partId,
                    systemId: systemId,
                    compendiumId: compendium.collection,
                    name: document.name,
                    imageUrl: document.img
                },
                salvage: this.partialComponentsFromCompendiumData(fabricateCompendiumData.component.salvage, compendium.collection, systemId),
                essences: this.essencesFromCompendiumData(fabricateCompendiumData.component.essences, essencesBySlug)
            });
        } catch (error) {
            throw new CompendiumEntryImportError(compendium.collection, document.id, fabricateCompendiumData, systemId, error as Error);
        }
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
    private async loadCompendiumContent(compendium:  CompendiumCollection<CompendiumCollection.Metadata>,
                                        maxAttempts: number): Promise<StoredDocument<DocumentInstanceForCompendiumMetadata<CompendiumCollection.Metadata>>[]> {
        let documents: Document[] = await compendium.getDocuments();
        let attempts: number = 0;
        while (!documents && (attempts <= maxAttempts)) {
            console.log(`${Properties.module.label} | Waiting for content in Compendium Pack ${compendium.collection} (Attempt ${attempts} of ${maxAttempts}. `);
            await this.wait(1000);
            attempts++;
            documents = await compendium.getDocuments();
        }
        return documents
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
            if (!essenceDefinitions.has(slug)) {
                throw new Error(`Essence '${slug}' does not exist in the Crafting System Specification. The available Essences are ${Array.from(essenceDefinitions.values()).map(essence => `'${essence.slug}'`).join(', ')}`);
            }
            const essence: EssenceDefinition = essenceDefinitions.get(slug);
            const amount: number = essenceRecord[slug];
            return new Unit<EssenceDefinition>(essence, amount);
        });
        return Combination.ofUnits(essenceUnits);
    }

    private partialComponentsFromCompendiumData(componentRecord: Record<string, number>, packKey: string, systemId: string): Combination<CraftingComponent> {
        if (!componentRecord) {
            return Combination.EMPTY();
        }
        const componentIds: string[] = Object.keys(componentRecord);
        if (componentIds.length === 0) {
            return Combination.EMPTY();
        }
        const componentUnits: Unit<CraftingComponent>[] = componentIds.map((partId: string) => {
            const component: CraftingComponent = new CraftingComponent({
                item: {
                    partId: partId,
                    compendiumId: packKey,
                    systemId: systemId,
                    name: "",
                    imageUrl: ""
                },
                salvage: Combination.EMPTY(),
                essences: Combination.EMPTY()
            });
            const amount: number = componentRecord[partId];
            return new Unit<CraftingComponent>(component, amount);
        });
        return Combination.ofUnits(componentUnits);
    }


    private populateComponentReferences(component: CraftingComponent, componentsById: Map<string, CraftingComponent>): CraftingComponent {
        try {
            return component.mutate({ salvage: this.populateCombination(component.salvage, componentsById) });
        } catch (error) {
            throw new CompendiumEntryReferencePopulationError(component, error as Error);
        }

    }

    private populateRecipeReferences(recipe: Recipe, componentsById: Map<string, CraftingComponent>): Recipe {
        try {
            return recipe.mutate({
                ingredients: this.populateCombination(recipe.ingredients, componentsById),
                catalysts: this.populateCombination(recipe.catalysts, componentsById),
                results: this.populateCombination(recipe.results, componentsById)
            });
        } catch (error: any) {
            throw new CompendiumEntryReferencePopulationError(recipe, error as Error);
        }
    }

    private populateCombination(combination: Combination<CraftingComponent>, componentsById: Map<string, CraftingComponent>): Combination<CraftingComponent> {
        if (combination.isEmpty()) {
            return Combination.EMPTY();
        }
        const populatedUnits: Unit<CraftingComponent>[] = combination.units
            .map((unit: Unit<CraftingComponent>) => {
                if (componentsById.has(unit.part.id)) {
                    return new Unit(componentsById.get(unit.part.id), unit.quantity);
                }
                throw new Error(`Crafting Component '${unit.part.id}' does not exist. `);
            });
        return Combination.ofUnits(populatedUnits)
    }
}

export {CompendiumImporter}