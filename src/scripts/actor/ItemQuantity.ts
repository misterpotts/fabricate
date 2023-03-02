interface ItemQuantityReader {

    read(item: any): Promise<number>;

}

interface ItemQuantityWriter {

    write(quantity: number, item: any): Promise<void>;

}

class DnD5EItemQuantityReader implements ItemQuantityReader {

    async read(item: any): Promise<number> {
        return item.system.quantity;
    }

}

class DnD5EItemQuantityWriter implements ItemQuantityWriter {

    async write(quantity: number, item: any): Promise<void> {
        item.system.quantity = quantity;
    }

}

class AlwaysOneItemQuantityReader implements ItemQuantityReader {

    async read(): Promise<number> {
        return 1;
    }

}

class NoItemQuantityWriter implements ItemQuantityWriter {

    async write(): Promise<void> {
        return;
    }

}

class MacroItemQuantityReader implements ItemQuantityReader {

    private _macro: Macro;

    constructor(macro: Macro) {
        this._macro = macro;
    }

    async read(item: any): Promise<number> {
        const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
        // @ts-ignore
        // todo: Macro Types are wrong in FVTT Types
        const script: string = this._macro.command;
        const fn = new AsyncFunction("item", script);
        try {
            return await fn(item);
        } catch(e) {
            throw new Error("There was an error in the supplied macro syntax. ");
        }
    }

}

class MacroItemQuantityWriter implements ItemQuantityWriter {

    private _macro: Macro;

    constructor(macro: Macro) {
        this._macro = macro;
    }

    async write(quantity: number, item: any): Promise<void> {
        const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
        // @ts-ignore
        // todo: Macro Types are wrong in FVTT Types
        const script: string = this._macro.command;
        const fn = new AsyncFunction("quantity", "item", script);
        try {
            return await fn(quantity, item);
        } catch(e) {
            throw new Error("There was an error in the supplied macro syntax. ");
        }
    }

}

export {
    ItemQuantityReader,
    ItemQuantityWriter,
    AlwaysOneItemQuantityReader,
    NoItemQuantityWriter,
    DnD5EItemQuantityReader,
    DnD5EItemQuantityWriter,
    MacroItemQuantityReader,
    MacroItemQuantityWriter
}