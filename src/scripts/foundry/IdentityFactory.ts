interface IdentityFactory {

    make(excludedValues?: string[]): string;

}

export { IdentityFactory }

class DefaultIdentityFactory implements IdentityFactory {

    make(excludedValues: string[] = []): string {
        const generated = randomID();
        if (!excludedValues.includes(generated)) {
            return generated;
        }
        return this.make(excludedValues);
    }

}

export { DefaultIdentityFactory }