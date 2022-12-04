import Properties from "../../../Properties";
import {GameProvider} from "../../../foundry/GameProvider";

interface Click {
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

    getClosestElementDataForKey(key: string, event: any): string {
        let element = event?.target;
        let value = element?.dataset[key];
        while (element && !value) {
            value = element?.dataset[key];
            element = element.parentElement;
        }
        return value;
    };

    getClickData(event: any): Click {
        const data = new Map(this._dataKeys.map(key => [key, this.getClosestElementDataForKey(key, event)]));
        if (event.shiftKey) {
            data.set("shiftPressed", String(event.shiftKey));
        }
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

type ApplicationAction<M> = (click: Click, currentState: M) => Promise<M>;

class ApplicationWindow<V, M> extends Application {

    private readonly _clickHandler: ClickHandler<V, M>;
    private readonly _stateManager: StateManager<V, M>;

    constructor({
                    clickHandler = new DefaultClickHandler({}),
                    options = {},
                    stateManager = NoStateManager.getInstance()
                }: {
        clickHandler?: ClickHandler<V, M>;
        options?: Partial<ApplicationOptions>;
        stateManager?: StateManager<V, M>;
    }) {
        super(options);
        this._clickHandler = clickHandler;
        this._stateManager = stateManager;
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
    }

    private async onClick(event: any): Promise<any> {
        await this._clickHandler.handle(event, this._stateManager);
        await this.render(true);
        return;
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
    Click,
    ClickHandler,
    DefaultClickHandler,
    ItemSheetExtension,
    ItemSheetModifier,
    SheetTab
}