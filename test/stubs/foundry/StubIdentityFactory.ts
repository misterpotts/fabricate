import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";

class StubIdentityFactory implements IdentityFactory {

    private readonly _queuedIdentities: string[];

    constructor(...queuedIdentities: string[]) {
        this._queuedIdentities = queuedIdentities.reverse();
    }

    make(excludedValues: string[] = []): string {
        if (this._queuedIdentities.length > 0) {
            const nextId = this._queuedIdentities.pop();
            if (!excludedValues.includes(nextId)) {
                return nextId;
            }
            throw new Error(`The stub identity provider is misconfigured. The queued ID ${nextId} is in the excluded values: ${excludedValues.join(", ")}`);
        }
        return this.randomIdentifier(excludedValues);
    }

    randomIdentifier(excludedValues: string[] = []): string {
        const generated = (Math.random() + 1)
            .toString(36)
            .substring(2);
        if (!excludedValues.includes(generated)) {
            return generated;
        }
        return this.randomIdentifier(excludedValues);
    }

}

export { StubIdentityFactory }