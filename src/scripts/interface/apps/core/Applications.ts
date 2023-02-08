import Properties from "../../../Properties";
import {GameProvider} from "../../../foundry/GameProvider";
import {DefaultDocumentManager} from "../../../foundry/DocumentManager";

interface ActionData {
    action: string;
    keys: {
        shift: boolean;
        alt: boolean;
        ctrl: boolean;
    };
    checked: boolean;
    data: Map<string, string>;
    document?: any;
    event: any;
}

interface ClickHandler<V, M> {

    readonly dataKeys: string[];

    handle(clickEvent: any, stateManager: StateManager<V, M>): Promise<M>;

}

interface DropHandler<V, M> {

    handle(dropEvent: any, stateManager: StateManager<V, M>): Promise<M>;

    getDragData(event: DragEvent): object;

}

const getClosestElementDataForKey: (key: string, event: any) => string = (key, event) => {
    let element = event?.target;
    let value = element?.dataset[key];
    while (element && !value) {
        value = element?.dataset[key];
        element = element.parentElement;
    }
    return value;
};

class DefaultClickHandler<V, M, S extends StateManager<V, M>> implements ClickHandler<V, M> {

    private readonly _dataKeys: string[];
    private readonly _actions: Map<string, ApplicationAction<M>>;

    constructor({
        dataKeys = [],
        actions = new Map()
                }: {
        dataKeys?: string[];
        actions?: Map<string, ApplicationAction<M>>;
    }) {
        this._dataKeys = [...dataKeys, "action"];
        this._actions = actions;
    }

    get actions(): Map<string, ApplicationAction<M>> {
        return this._actions;
    }

    get dataKeys(): string[] {
        return this._dataKeys;
    }

    getClickData(event: any): ActionData {
        const data = new Map(this._dataKeys.map(key => [key, getClosestElementDataForKey(key, event)]));
        return {
            action: data.get("action"),
            data,
            event,
            checked: event.target?.checked ?? false,
            keys: {
                shift: event.shiftKey,
                alt: event.altKey,
                ctrl: event.ctrlKey,
            }
        };
    }

    async handle(clickEvent: any, stateManager: S): Promise<M> {
        const click = this.getClickData(clickEvent);
        if (this._actions.has(click.action)) {
            const model = await this._actions.get(click.action)(click, stateManager.getModelState());
            if (model) {
                await stateManager.save(model);
                return model;
            }
            return stateManager.getModelState();
        }
        if (click.action) {
            throw new Error(`Could not determine action for click event ${click.action}`);
        }
    }

}

class DefaultDropHandler<V, M, S extends StateManager<V, M>> implements DropHandler<V, M> {

    private readonly _actions: Map<string, ApplicationAction<M>>;
    private readonly _sourceDataKeys: string[];
    private readonly _targetDataKeys: string[];

    constructor({
        actions = new Map(),
        sourceDataKeys = [],
        targetDataKeys = []
    }: {
        actions?: Map<string, ApplicationAction<M>>;
        sourceDataKeys?: string[];
        targetDataKeys?: string[];
    }) {
        this._actions = actions;
        this._sourceDataKeys = sourceDataKeys;
        this._targetDataKeys = [...targetDataKeys, "dropTrigger"];
    }

    async handle(dropEvent: any, stateManager: S): Promise<M> {
        const dropData = await this.getDropData(dropEvent);
        if (this._actions.has(dropData.action)) {
            const model = await this._actions.get(dropData.action)(dropData, stateManager.getModelState());
            if (model) {
                await stateManager.save(model);
                return model;
            }
            return stateManager.getModelState();
        }
        if (dropData.action) {
            throw new Error(`Could not determine action for click event ${dropData.action}`);
        }
    }

    getDragData(event: DragEvent): object {
        const data = new Map(this._sourceDataKeys.map(key => [key, getClosestElementDataForKey(key, event)]));
        return Object.fromEntries(data.entries());
    }

    private async getDropData(dropEvent: any): Promise<ActionData> {
        const targetData = new Map(this._targetDataKeys.map(key => [key, getClosestElementDataForKey(key, dropEvent)]));
        const rawJsonDropData: string = dropEvent.dataTransfer.getData("application/json");
        const rawTextDropData: string = dropEvent.dataTransfer.getData("text/plain");
        const actionData: ActionData = {
            action: targetData.get("dropTrigger"),
                event: dropEvent,
            data : new Map<string, string>(targetData),
            document: null,
            checked: false,
            keys: {
                shift: dropEvent.shiftKey,
                alt: dropEvent.altKey,
                ctrl: dropEvent.ctrlKey,
            }
        }
        if (rawJsonDropData) {
            try {
                const dropData: any = JSON.parse(rawJsonDropData);
                Object.entries(dropData).forEach(entry => {
                    if (actionData.data.has(entry[0])) {
                        console.warn(`The data key "${entry[0]}" exists in both the source and target. Overwriting source value with target value. `);
                    }
                    actionData.data.set(entry[0], <string>entry[1]);
                });
            } catch (e: any) {
                console.error(`Something was dropped onto a Fabricate Drop Zone, but the event data could not be read. Caused by ${e}`);
            }
        }
        if (rawTextDropData) {
            try {
                const dropData = JSON.parse(rawTextDropData);
                if (Properties.module.documents.supportedTypes.indexOf(dropData.type) >= 0) {
                    const document: any = await new DefaultDocumentManager().getDocumentByUuid(dropData.uuid);
                    actionData.document = document;
                    if (document) {
                        actionData.data.set("partId", document.uuid);
                    }
                }
            } catch (e: any) {
                console.error(`Something was dropped onto a Fabricate Drop Zone, but the event data could not be read. Caused by ${e}`);
            }
        }
        return actionData;
    }
}

interface StateManager<V, M> {

    getModelState(): M;

    getViewData(): V;

    save(model: M): Promise<M>;

    load(): Promise<M>;

}

class NoStateManager implements StateManager<any, any> {

    private static readonly _INSTANCE = new NoStateManager();

    private constructor() {}

    public static getInstance(): NoStateManager {
        return NoStateManager._INSTANCE;
    }

    getModelState(): any {
        return {};
    }

    getViewData(): any {
        return {};
    }

    async load(): Promise<any> {
        return {};
    }

    async save(): Promise<any> {
        return {};
    }

}

interface FormError {

    field: string;
    detail: string;

}

interface SubmissionHandler<F, M> {

    validate(formData: F): FormError[];

    process(formData: F, currentState: M): Promise<M>;

}

type ApplicationAction<M> = (actionData: ActionData, currentState: M) => Promise<M> | Promise<void>;

interface ContextMenuDefinition {
    entries: ContextMenuEntry[];
    selector: string;
}

class ApplicationWindow<V, M> extends Application {

    private readonly _clickHandler: ClickHandler<V, M>;
    private readonly _dropHandler: DropHandler<V, M>;
    private readonly _stateManager: StateManager<V, M>;
    private readonly _searchMappings: Map<string, (value: string, currentState: M) => Promise<void>>;
    private readonly _searches: Map<string, any> = new Map();
    private _contextMenuDefinitions: ContextMenuDefinition[];

    constructor({
        clickHandler = new DefaultClickHandler({}),
        dropHandler = new DefaultDropHandler({}),
        options = {},
        stateManager = NoStateManager.getInstance(),
        searchMappings = new Map(),
        contextMenuDefinitions = []
    }: {
        clickHandler?: ClickHandler<V, M>;
        dropHandler?: DropHandler<V, M>;
        options?: Partial<ApplicationOptions>;
        stateManager?: StateManager<V, M>;
        searchMappings?: Map<string, (value: string, currentState: M) => Promise<void>>;
        contextMenuDefinitions?: ContextMenuDefinition[];
    }) {
        super(options);
        this._clickHandler = clickHandler;
        this._dropHandler = dropHandler;
        this._stateManager = stateManager;
        this._searchMappings = searchMappings;
        this._contextMenuDefinitions = contextMenuDefinitions;
    }

    async render(force: boolean = true): Promise<void> {
        super.render(force);
    }

    async reload(): Promise<void> {
        await this._stateManager.load();
        return this.render(true);
    }

    async getData(): Promise<any> {
        return this._stateManager.getViewData();
    }

    activateListeners(html: JQuery): void {
        super.activateListeners(html);
        this._contextMenu(html);
        const rootElement = html[0];
        rootElement.addEventListener("click", this.onClick.bind(this));
        html.find(`input[name="search"]`).each((_index, element) => {
            element.addEventListener("click", (e: any) => e.preventDefault());
            element.addEventListener("keyup", this.onSearch.bind(this));
        });
    }

    private async onSearch(event: any): Promise<void> {
        const searchId = getClosestElementDataForKey("searchId", event);
        if (!this._searchMappings.has(searchId)) {
            console.error(`A search was triggered on a Fabricate Application window with the search ID ${searchId}, but no handler was registered for it.`);
        }
        const searchFunction = this._searchMappings.get(searchId);
        if (this._searches.has(searchId)) {
            clearTimeout(this._searches.get(searchId));
        }
        const searchText = event.target.value.trim();
        await searchFunction(searchText, this._stateManager.getModelState());
        this._searches.set(searchId, setTimeout(() => {
            this.render(true);
        }, 1000));
    }

    private async onClick(event: any): Promise<any> {
        if (event.target?.name === "search") {
            return;
        }
        await this._clickHandler.handle(event, this._stateManager);
        await this.render(true);
        return;
    }

    async _onDrop(event: any): Promise<void> {
        await this._dropHandler.handle(event, this._stateManager);
        await this.render(true);
        return;
    }

    protected _onDragStart(event: DragEvent): void {
        const dragData = this._dropHandler.getDragData(event);
        event.dataTransfer.setData("application/json", JSON.stringify(dragData));
    }

    protected _canDragStart(selector: string): boolean {
        return super._canDragStart(selector);
    }

    protected _contextMenu(html: JQuery) {
        this._contextMenuDefinitions
            .forEach(contextMenuDefinition => new ContextMenu(html, contextMenuDefinition.selector, contextMenuDefinition.entries));
    }

}

class NoSubmissionHandler implements SubmissionHandler<any, any> {

    private static readonly _INSTANCE = new NoSubmissionHandler();

    private constructor() {}

    public static getInstance(): NoSubmissionHandler {
        return NoSubmissionHandler._INSTANCE;
    }

    formatErrors(): string {
        return "";
    }

    async process(): Promise<any> {
        return {}
    }

    validate(): FormError[] {
        return [];
    }

}

class FormApplicationWindow<V, M, F> extends FormApplication {

    private readonly _clickHandler: ClickHandler<V, M>;
    private readonly _stateManager: StateManager<V, M>;
    private readonly _submissionHandler: SubmissionHandler<F, M>;

    constructor({
        clickHandler = new DefaultClickHandler({}),
        options = {},
        stateManager = NoStateManager.getInstance(),
        submissionHandler = NoSubmissionHandler.getInstance()
                }: {
        clickHandler?: ClickHandler<V, M>;
        options?: Partial<FormApplicationOptions>;
        stateManager?: StateManager<V, M>;
        submissionHandler?: SubmissionHandler<F, M>;
    }) {
        super({}, options); // todo: figure out what the value of concrete object *should* be when we're not dealing with a document (if not "{}")
        this._clickHandler = clickHandler;
        this._stateManager = stateManager;
        this._submissionHandler = submissionHandler;
    }

    protected _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        console.log("Update object");
        this.render();
        return undefined;
    }

    render(force: boolean = true) {
        super.render(force);
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);
        const rootElement = html[0];
        rootElement.addEventListener("click", this.onClick.bind(this));
    }

    private async onClick(event: any): Promise<any> {
        return this._clickHandler.handle(event, this._stateManager);
    }

    override async getData(): Promise<any> {
        return this._stateManager.getViewData();
    }

    protected async _onSubmit(event: Event, options: FormApplication.OnSubmitOptions): Promise<any> {
        event.preventDefault();
        const formData = foundry.utils.expandObject(this._getSubmitData(options?.updateData));
        const errors = this._submissionHandler.validate(formData);
        if (errors.length > 0) {
            ui.notifications.error(this.formatErrors(errors));
            return;
        }
        const model = await this._submissionHandler.process(formData, this._stateManager.getModelState());
        await this._stateManager.save(model);
        await this.close();
        return formData;
    }

    private formatErrors(errors: FormError[]): string {
        if (errors.length === 1) {
            return `${Properties.module.label} | ${errors[0].detail}`;
        }
        const errorDetail = errors
            .map((error, index) => `${index + 1}) ${error.detail}`)
            .join(", ");
        const GAME = new GameProvider().globalGameObject();
        const localizationPath = `${Properties.module.id}.ui.notifications.submissionError.prefix`
        return `${Properties.module.label} | ${GAME.i18n.localize(localizationPath)}: ${errorDetail}`
    }

}

type SheetTabAction = (data: Map<string, string>) => Promise<void>;

interface SheetTab {
    height?: number;
    resize: boolean;
    dataKeys: string[];

    id: string;
    name: string;
    data: object;
    templatePath: string;
    containerClass: string;
    innerClass: string;
    buttonClass: string;
    getAction(action: string): SheetTabAction;
}

interface ItemSheetModifier {
    tabs: SheetTab[];

    hasTabs(): boolean;

    prepareData(app: any): Promise<void>;
}

class ItemSheetExtension {

    private static readonly _defaultTabHeight = 400;

    private readonly _html: any;
    private readonly _itemSheetModifier: ItemSheetModifier;
    private readonly _app: any;
    private _previouslySelectedTab = "";

    constructor({
        app,
        html,
        itemSheetModifier
    }: {
        html: any;
        app: any;
        itemSheetModifier: ItemSheetModifier
    }) {
        this._html = html;
        this._app = app;
        this._itemSheetModifier = itemSheetModifier;
    }

    public async render(): Promise<void> {

        await this._itemSheetModifier.prepareData(this._app);

        if (!this._itemSheetModifier.hasTabs()) {
            return;
        }

        const tabs = this._html.find(`.tabs[data-group="primary"]`);
        const body = $(this._html.find(`.sheet-body`));

        for (const tab of this._itemSheetModifier.tabs) {

            // Create the tab button
            const tabElementFind = tabs.find(`.${tab.buttonClass}`);
            if (!tabElementFind.length) {
                tabs.append($(
                    `<a class="item ${tab.buttonClass}" data-tab="${tab.id}">${tab.name}</a>`
                ));
                if (tab.resize) {
                    const addedTabElement = tabs.find(`.${tab.buttonClass}`);
                    addedTabElement.click((_e: any) => {
                        const position = this._app.position;
                        position.height = tab.height ?? ItemSheetExtension._defaultTabHeight;
                        this._app.setPosition(position);
                    });
                }
            }

            // Create the tab content container
            const containerElementFind = body.find(`.${tab.containerClass}`);
            if (!containerElementFind.length) {
                body.append($(
                    `<div class="tab fabricate-item-sheet-tab ${tab.containerClass}" data-group="primary" data-tab="${tab.id}"></div>`
                ));
            }
            const template = await renderTemplate(tab.templatePath, tab.data);

            // Replace the tab body content with the rendered template
            let innerElementFind = body.find(`.${tab.innerClass}`);
            if (innerElementFind.length) {
                innerElementFind.replaceWith(template);
            } else {
                const containerElementFind = body.find(`.tab.${tab.containerClass}`);
                containerElementFind.append(template);
            }

            // find the updated inner element and add click event listeners
            innerElementFind = body.find(`.${tab.innerClass}`);
            this.addClickEventHandlers(innerElementFind, tab);

            // Re-select the tab in navigation if it was previously selected
            if (this._previouslySelectedTab === tab.id && !this.tabSelected(tab.id, tabs)) {
                this._app._tabs[0].activate(tab.id);
                this._previouslySelectedTab = "";
            }

        }

    }

    private addClickEventHandlers(element: any, tab: SheetTab) {
        const itemSheetExtension = this;
        element.click(async (event: any) => {
            event.preventDefault();
            const action = getClosestElementDataForKey("action", event);
            if (!action) {
                return;
            }

            const sheetTabAction = tab.getAction(action);
            if (!sheetTabAction) {
                throw new Error(`No implementation was found for the action "${action} in Sheet Extension ${tab.id}". `);
            }
            const data = new Map(tab.dataKeys.map(key => [key, getClosestElementDataForKey(key, event)]));
            await sheetTabAction(data);

            // Stash the tab ID for reactivating it after rendering
            const tabId = getClosestElementDataForKey("tab", event);
            this._previouslySelectedTab = tabId;
            await itemSheetExtension.render();
        });
    }

    private tabSelected(tabId: string, tabs: any): boolean {
        return tabs.find(`[data-tab="${tabId}"]`).hasClass('active');
    }

}

export {
    ApplicationWindow,
    FormApplicationWindow,
    StateManager,
    NoStateManager,
    ApplicationAction,
    SubmissionHandler,
    FormError,
    ActionData,
    ClickHandler,
    DefaultClickHandler,
    DropHandler,
    DefaultDropHandler,
    ItemSheetExtension,
    ItemSheetModifier,
    SheetTab,
    SheetTabAction
}