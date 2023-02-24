class FabricateEventBus {

    private static _INSTANCE: FabricateEventBus = new FabricateEventBus();

    private static readonly _listeners: Map<string, ((document: any) => void)[]> = new Map();

    private constructor() {}

    public static get INSTANCE(): FabricateEventBus {
        return FabricateEventBus._INSTANCE;
    }

    public static register(eventType: string, listener: (document: any) => void) {
        if (!FabricateEventBus._listeners.has(eventType)) {
            FabricateEventBus._listeners.set(eventType, []);
        }
        const listeners = FabricateEventBus._listeners.get(eventType);
        listeners.push(listener);
    }

    public static dispatch(event: FabricateEvent) {
        FabricateEventBus._listeners.get(event.eventType).forEach(listener => listener(event));
    }

}

interface FabricateEvent {
    eventType: string;
}

class ItemDeleted implements FabricateEvent {

    private static readonly _eventType: string = "itemDeleted";

    private readonly _document: any;

    constructor(document: any) {
        this._document = document;
    }

    get document(): any {
        return this._document;
    }

    get eventType(): string {
        return ItemDeleted._eventType;
    }

    static get eventType(): string {
        return ItemDeleted._eventType;
    }

}

export { FabricateEventBus, FabricateEvent, ItemDeleted }