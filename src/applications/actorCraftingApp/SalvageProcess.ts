interface SalvageProcess {

    readonly componentName: string;

    readonly isReady: boolean;

}

export { SalvageProcess };

class DefaultSalvageProcess implements SalvageProcess {

    private readonly _componentName: string;

    constructor({
        componentName
    }: {
        componentName: string;
    }) {
        this._componentName = componentName;
    }

    get componentName() {
        return this._componentName;
    }

    get isReady(): boolean {
        return true;
    }

}

export { DefaultSalvageProcess };

class NoSalvageProcess implements SalvageProcess {

    get componentName() {
        return "No Component Selected";
    }

    get isReady(): boolean {
        return false;
    }

}

export { NoSalvageProcess };