interface FormAction<M> {

    do(model: M): Promise<void>;

}

interface FormInteractionHandler<M> {

    click(event: any): Promise<void>;

    register(actionType: string, action: FormAction<M>): void;

}

interface FormStateManager<V, M> {

    load(filteredClickData: Map<string, string>): Promise<M>;

    save(viewData: V): Promise<M>;

}

class DefaultFormInteractionHandler<V, M> implements FormInteractionHandler<M> {

    private readonly _actionDataKey: string = "action";

    private readonly _dataKeys: string[];
    private readonly _formActionsByType: Map<string, FormAction<M>>;
    private readonly _formStateManager: FormStateManager<V, M>;

    constructor({
        dataKeys,
        formActionsByType,
        formStateManager
    }: {
        dataKeys: string[];
        formActionsByType: Map<string, FormAction<M>>;
        formStateManager: FormStateManager<V, M>;
    }) {
        this._dataKeys = dataKeys;
        this._formActionsByType = formActionsByType;
        this._formStateManager = formStateManager;
    }

    async click(event: any): Promise<void> {
        const keys = [...this._dataKeys, this._actionDataKey];
        const data = new Map(keys.map(key => [key, this.getClosestElementDataForKey(key, event)]));
        if (!data.has(this._actionDataKey)) {
            throw new Error("An unknown action was triggered on a Fabricate Form Application. ");
        }
        const action = data.get(this._actionDataKey);
        if (!this._formActionsByType.has(action)) {
            throw new Error(`The action "${action}" was triggered, but no form action was registered to handle it! `);
        }
        const filteredClickData = new Map(Array.from(data.entries()).filter(entry => entry[0] && entry[1]));
        await this._formActionsByType.get(action).do(await this._formStateManager.load(filteredClickData));
        return;
    }

    private getClosestElementDataForKey(key: string, event: any): string {
        let element = event?.target;
        let value = element?.dataset[key];
        while (element && !value) {
            value = element?.dataset[key];
            element = element.parentElement;
        }
        return value;
    };

    register(actionType: string, action: FormAction<M>): void {
        this._formActionsByType.set(actionType, action);
    }

}

// todo: finish tinkering as this will be really useful
class FabricateFormApplication<T> extends FormApplication {

    private readonly _formInteractionHandler: FormInteractionHandler<T>;

    constructor(args: any, formInteractionHandler: FormInteractionHandler<T>) {
        super(args);
        this._formInteractionHandler = formInteractionHandler;
    }

    protected _updateObject(_event: Event, _formData: object | undefined): Promise<unknown> {
        return Promise.resolve(undefined);
    }

    override activateListeners(html: JQuery): void {
        super.activateListeners(html);
        const rootElement = html[0];
        rootElement.addEventListener("click", this._formInteractionHandler.click.bind(this));
    }

    override getData(options?: Partial<FormApplicationOptions>): Promise<FormApplication.Data<{}, FormApplicationOptions>> | FormApplication.Data<{}, FormApplicationOptions> {
        return super.getData(options);
    }

}