import Properties from "../../../Properties";
import {GameProvider} from "../../../foundry/GameProvider";

interface ActionData {
    action: string;
    keys: {
        shift: boolean;
        alt: boolean;
        ctrl: boolean;
    };
    data: Map<string, string>;
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
            await stateManager.save(model);
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
        const dropData = this.getDropData(dropEvent);
        if (this._actions.has(dropData.action)) {
            const model = await this._actions.get(dropData.action)(dropData, stateManager.getModelState());
            await stateManager.save(model);
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

    private getDropData(dropEvent: any): ActionData {
        const targetData = new Map(this._targetDataKeys.map(key => [key, getClosestElementDataForKey(key, dropEvent)]));
        const rawDropData: string = dropEvent.dataTransfer.getData("application/json");
        const data = new Map<string, string>(targetData);
        try {
            const dropData: any = JSON.parse(rawDropData);
            Object.entries(dropData).forEach(entry => {
                if (data.has(entry[0])) {
                    console.warn(`The data key "${entry[0]}" exists in both the source and target. Overwriting source value with target value. `);
                }
                data.set(entry[0], <string>entry[1]);
            });
        } catch (e: any) {
            console.error(`Something was dropped onto a Fabricate Drop Zone, but the event data could not be read. Caused by ${{e}}`);
        }
        return {
            action: targetData.get("dropTrigger"),
            event: dropEvent,
            data,
            keys: {
                shift: dropEvent.shiftKey,
                alt: dropEvent.altKey,
                ctrl: dropEvent.ctrlKey,
            }
        }
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

type ApplicationAction<M> = (actionData: ActionData, currentState: M) => Promise<M>;

class ApplicationWindow<V, M> extends Application {

    private readonly _clickHandler: ClickHandler<V, M>;
    private readonly _dropHandler: DropHandler<V, M>;
    private readonly _stateManager: StateManager<V, M>;
    private readonly _searchMappings: Map<string, (value: string, currentState: M) => Promise<void>>;
    private readonly _searches: Map<string, any> = new Map();

    constructor({
        clickHandler = new DefaultClickHandler({}),
        dropHandler = new DefaultDropHandler({}),
        options = {},
        stateManager = NoStateManager.getInstance(),
        searchMappings = new Map()
    }: {
        clickHandler?: ClickHandler<V, M>;
        dropHandler?: DropHandler<V, M>;
        options?: Partial<ApplicationOptions>;
        stateManager?: StateManager<V, M>;
        searchMappings?: Map<string, (value: string, currentState: M) => Promise<void>>;
    }) {
        super(options);
        this._clickHandler = clickHandler;
        this._dropHandler = dropHandler;
        this._stateManager = stateManager;
        this._searchMappings = searchMappings;
    }

    render(force: boolean = true): void {
        super.render(force);
    }

    async getData(): Promise<any> {
        return this._stateManager.getViewData();
    }

    activateListeners(html: JQuery): void {
        super.activateListeners(html);
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

interface SheetTab {

    id: string;
    name: string;
    data: object;
    templatePath: string;
    containerClass: string;
    innerClass: string;
    buttonClass: string;

}

interface ItemSheetModifier {
    tabs: SheetTab[];

    hasTabs(): boolean;

    prepareData(app: any): Promise<void>;
}

class ItemSheetExtension {
    private readonly _html: any;
    private readonly _itemSheetModifier: ItemSheetModifier;
    private readonly _app: any;

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
        if (this._itemSheetModifier.hasTabs()) {
            const tabs = this._html.find(`.tabs[data-group="primary"]`);
            const body = $(this._html.find(`.sheet-body`));
            for (const tab of this._itemSheetModifier.tabs) {
                tabs.append($(
                    `<a class="item ${tab.buttonClass}" data-tab="${tab.id}">${tab.name}</a>`
                ));
                body.append($(
                    `<div class="tab ${tab.containerClass}" data-group="primary" data-tab="${tab.id}"></div>`
                ));
                const template = await renderTemplate(tab.templatePath, tab.data);
                const element = this._html.find(tab.innerClass);
                if (element && element.length) {
                    element.replaceWith(template);
                } else {
                    this._html.find(`.tab.${tab.containerClass}`).append(template);
                }
            }
        }
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
    SheetTab
}