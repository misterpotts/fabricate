import {
    ActionData,
    ApplicationWindow,
    DefaultClickHandler,
    DefaultDropHandler,
    StateManager
} from "./core/Applications";
import {CombinationChoice, Recipe} from "../../crafting/Recipe";
import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import FabricateApplication from "../FabricateApplication";
import {CraftingSystem} from "../../system/CraftingSystem";
import {Essence} from "../../common/Essence";
import {Combination, Unit} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";

interface RecipeManagerView {

    recipe: {
        id: string;
        name: string;
        imageUrl: string;
        essences: Unit<Essence>[];
        catalysts: Combination<CraftingComponent>;
        ingredients: CombinationChoice<CraftingComponent>;
        results: CombinationChoice<CraftingComponent>;
    };
    system: {
        id: string;
        essences: Essence[];
        components: CraftingComponent[];
        hasEssences: boolean;
    };
    search: {
        components: string;
    };

}

class RecipeManagerModel {
    private _componentSearch: string = "";

    private readonly _system: CraftingSystem;
    private readonly _recipe: Recipe;
    private readonly _availableEssences: Map<string, Essence>;
    private readonly _availableComponents: Map<string, CraftingComponent>;

    constructor({
        recipe,
        system,
        availableEssences,
        availableComponents
    }: {
        recipe: Recipe;
        system: CraftingSystem;
        availableEssences: Essence[];
        availableComponents: CraftingComponent[];
    }) {
        this._recipe = recipe;
        this._system = system;
        this._availableEssences = new Map(availableEssences.map(essence => [essence.id, essence]));
        this._availableComponents = new Map(availableComponents.map(component => [component.id, component]));
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    get system(): CraftingSystem {
        return this._system;
    }

    get availableEssences(): Essence[] {
        return Array.from(this._availableEssences.values());
    }

    get availableComponents(): CraftingComponent[] {
        return Array.from(this._availableComponents.values());
    }

    get componentSearch(): string {
        return this._componentSearch;
    }

    set componentSearch(value: string) {
        this._componentSearch = value;
    }

    addIngredientOption(componentId: string): RecipeManagerModel {
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`The Component with ID ${componentId} is not part of this Crafting System. `);
        }
        const component = this._availableComponents.get(componentId);
        this._recipe.addIngredientOption(Combination.of(component, 1));
        return this;
    }

    async decrementIngredientChoiceComponent(optionId: string, componentId: string): Promise<RecipeManagerModel> {
        if (!this._recipe.ingredientOptions.contains(optionId)) {
            throw new Error(`The option with ID ${optionId} is not part of this Recipe. `);
        }
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to remove as an ingredient to this Recipe. `);
        }
        const combination = this._recipe.ingredientOptions.getChoice(optionId);
        const component = this._availableComponents.get(componentId);
        const updatedCombination = combination.minus(new Unit(component, 1));
        this._recipe.setIngredientOption(optionId, updatedCombination);
        return this;
    }

    async incrementIngredientChoiceComponent(optionId: string, componentId: string): Promise<RecipeManagerModel> {
        if (!this._recipe.ingredientOptions.contains(optionId)) {
            throw new Error(`The option with ID ${optionId} is not part of this Recipe. `);
        }
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as an ingredient to this Recipe. `);
        }
        const combination = this._recipe.ingredientOptions.getChoice(optionId);
        const component = this._availableComponents.get(componentId);
        this._recipe.setIngredientOption(optionId, combination.add(new Unit(component, 1)));
        return this;
    }

    addComponentToIngredientOption(optionId: string, componentId: string) {
        if (!this._recipe.ingredientOptions.contains(optionId)) {
            throw new Error(`The option with ID ${optionId} is not part of this Recipe. `);
        }
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as an ingredient to this combination option. `);
        }
        const combination = this._recipe.ingredientOptions.getChoice(optionId);
        const component = this._availableComponents.get(componentId);
        this._recipe.setIngredientOption(optionId, combination.add(new Unit(component, 1)));
        return this;
    }

    addResultOption(componentId: string): RecipeManagerModel {
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`The Component with ID ${componentId} is not part of this Crafting System. `);
        }
        const component = this._availableComponents.get(componentId);
        this._recipe.addResultOption(Combination.of(component, 1));
        return this;
    }

    async decrementResultChoiceComponent(optionId: string, componentId: string): Promise<RecipeManagerModel> {
        if (!this._recipe.resultOptions.contains(optionId)) {
            throw new Error(`The option with ID ${optionId} is not part of this Recipe. `);
        }
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to remove as a result of this Recipe. `);
        }
        const combination = this._recipe.resultOptions.getChoice(optionId);
        const component = this._availableComponents.get(componentId);
        const updatedCombination = combination.minus(new Unit(component, 1));
        this._recipe.setResultOption(optionId, updatedCombination);
        return this;
    }

    async incrementResultChoiceComponent(optionId: string, componentId: string): Promise<RecipeManagerModel> {
        if (!this._recipe.resultOptions.contains(optionId)) {
            throw new Error(`The option with ID ${optionId} is not part of this Recipe. `);
        }
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as a result of this Recipe. `);
        }
        const combination = this._recipe.resultOptions.getChoice(optionId);
        const component = this._availableComponents.get(componentId);
        this._recipe.setResultOption(optionId, combination.add(new Unit(component, 1)));
        return this;
    }

    addComponentToResultOption(optionId: string, componentId: string) {
        if (!this._recipe.resultOptions.contains(optionId)) {
            throw new Error(`The option with ID ${optionId} is not part of this Recipe. `);
        }
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as a result to this combination option. `);
        }
        const combination = this._recipe.resultOptions.getChoice(optionId);
        const component = this._availableComponents.get(componentId);
        this._recipe.setResultOption(optionId, combination.add(new Unit(component, 1)));
        return this;
    }

    addCatalyst(componentId: string) {
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as a catalyst tp this Recipe. `);
        }
        const component = this._availableComponents.get(componentId);
        this._recipe.catalysts = this._recipe.catalysts.add(new Unit(component, 1));
        return this;
    }

    decrementCatalyst(componentId: string): RecipeManagerModel {
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to remove as a catalyst for this Recipe. `);
        }
        const component = this._availableComponents.get(componentId);
        this._recipe.catalysts = this._recipe.catalysts.minus(new Unit(component, 1));
        return this;
    }

    incrementCatalyst(componentId: string): RecipeManagerModel {
        if (!this._availableComponents.has(componentId)) {
            throw new Error(`No Component was found with the ID "${componentId}" to add as a catalyst for this Recipe. `);
        }
        const component = this._availableComponents.get(componentId);
        this._recipe.catalysts = this._recipe.catalysts.add(new Unit(component, 1));
        return this;
    }

    decrementEssence(essenceId: string) {
        if (!this._availableEssences.has(essenceId)) {
            throw new Error(`No Essence was found with the ID "${essenceId}" to remove from this Recipe. `);
        }
        const essence = this._availableEssences.get(essenceId);
        this._recipe.essences = this._recipe.essences.minus(new Unit(essence, 1));
        return this;
    }

    incrementEssence(essenceId: string) {
        if (!this._availableEssences.has(essenceId)) {
            throw new Error(`No Essence was found with the ID "${essenceId}" to add to this Recipe. `);
        }
        const essence = this._availableEssences.get(essenceId);
        this._recipe.essences = this._recipe.essences.add(new Unit(essence, 1));
        return this;
    }

}

class RecipeStateManager implements StateManager<RecipeManagerView, RecipeManagerModel> {

    private readonly _model: RecipeManagerModel;

    constructor(model: RecipeManagerModel) {
        this._model = model;
    }

    getModelState(): RecipeManagerModel {
        return this._model;
    }

    getViewData(): RecipeManagerView {
        return {
            system: {
                id: this._model.system.id,
                hasEssences: this._model.system.hasEssences,
                essences: this._model.availableEssences,
                components: this.filterComponents(this._model.availableComponents, this._model.componentSearch)
            },
            recipe: {
                id: this._model.recipe.id,
                essences: this.prepareEssenceData(this._model.availableEssences, this._model.recipe.essences),
                catalysts: this._model.recipe.catalysts,
                imageUrl: this._model.recipe.imageUrl,
                name: this._model.recipe.name,
                ingredients: this._model.recipe.ingredientOptions,
                results: this._model.recipe.resultOptions
            },
            search: {
                components: this._model.componentSearch
            }
        };
    }

    private filterComponents(availableComponents: CraftingComponent[], nameSearch: string): CraftingComponent[] {
        if (!nameSearch) {
            return availableComponents;
        }
        return availableComponents.filter(component => component.name.search(new RegExp(nameSearch, "i")) >= 0);
    }

    load(): Promise<RecipeManagerModel> {
        return Promise.resolve(undefined);
    }

    async save(model: RecipeManagerModel): Promise<RecipeManagerModel> {
        await FabricateApplication.systemRegistry.saveCraftingSystem(model.system);
        return this.getModelState();
    }

    private prepareEssenceData(all: Essence[], includedAmounts: Combination<Essence>): Unit<Essence>[] {
        return all.map(essence => new Unit(essence, includedAmounts.amountFor(essence.id)));
    }

}

class RecipeManagerAppFactory {

    async make(recipe: Recipe, system: CraftingSystem): Promise<ApplicationWindow<RecipeManagerView, RecipeManagerModel>> {
        await system.loadPartDictionary();
        return new ApplicationWindow<RecipeManagerView, RecipeManagerModel>({
            stateManager: new RecipeStateManager(new RecipeManagerModel({
                recipe,
                system,
                availableEssences: await system.getEssences(),
                availableComponents: await system.getComponents()
            })),
            searchMappings: new Map([
                ["availableComponents", async (text: string, currentState: RecipeManagerModel) => {
                    currentState.componentSearch = text;
                }]
            ]),
            dropHandler: new DefaultDropHandler({
                sourceDataKeys: ["partId"],
                targetDataKeys: ["optionId"],
                actions: new Map([
                    ["addIngredientOption", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        return currentState.addIngredientOption(actionData.data.get("partId"));
                    }],
                    ["addComponentToIngredientOption", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        const optionId = actionData.data.get("optionId");
                        const componentId = actionData.data.get("partId");
                        return currentState.addComponentToIngredientOption(optionId, componentId);
                    }],
                    ["addResultOption", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        return currentState.addResultOption(actionData.data.get("partId"));
                    }],
                    ["addComponentToResultOption", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        const optionId = actionData.data.get("optionId");
                        const componentId = actionData.data.get("partId");
                        return currentState.addComponentToResultOption(optionId, componentId);
                    }]
                ])
            }),
            clickHandler: new DefaultClickHandler({
                dataKeys: ["componentId", "optionId"],
                actions: new Map([
                    ["editRecipeIngredient", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        const componentId = actionData.data.get("componentId");
                        const optionId = actionData.data.get("optionId");
                        if (actionData.keys.shift) {
                            return currentState.decrementIngredientChoiceComponent(optionId, componentId);
                        } else {
                            return currentState.incrementIngredientChoiceComponent(optionId, componentId);
                        }
                    }],
                    ["editRecipeResult", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        const componentId = actionData.data.get("componentId");
                        const optionId = actionData.data.get("optionId");
                        if (actionData.keys.shift) {
                            return currentState.decrementResultChoiceComponent(optionId, componentId);
                        } else {
                            return currentState.incrementResultChoiceComponent(optionId, componentId);
                        }
                    }],
                    ["clearComponentSearch", async (_actionData: ActionData, currentState: RecipeManagerModel) => {
                        currentState.componentSearch = "";
                        return currentState;
                    }],
                    ["addRecipeCatalyst", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        const componentId = actionData.data.get("componentId");
                        return currentState.addCatalyst(componentId);
                    }],
                    ["editRecipeCatalyst", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        const componentId = actionData.data.get("componentId");
                        if (actionData.keys.shift) {
                            return currentState.decrementCatalyst(componentId);
                        } else {
                            return currentState.incrementCatalyst(componentId);
                        }
                    }],
                    ["editRecipeEssence", async (actionData: ActionData, currentState: RecipeManagerModel) => {
                        const essenceId = actionData.data.get("essenceId");
                        if (actionData.keys.shift) {
                            return currentState.decrementEssence(essenceId);
                        } else {
                            return currentState.incrementEssence(essenceId);
                        }
                    }]
                ])
            }),
            options: {
                title: new GameProvider().globalGameObject().i18n.localize(`${Properties.module.id}.RecipeManagerApp.title`),
                id: `${Properties.module.id}-recipe-manager`,
                template: Properties.module.templates.recipeManagerApp,
                classes: ["sheet", "journal-sheet", "journal-entry"],
                tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "summary"}],
                dragDrop: [{dragSelector: ".fabricate-draggable", dropSelector: ".fabricate-drop-zone"}],
                width: 500,
                resizable: true
            }
        });
    }

}

export default new RecipeManagerAppFactory();