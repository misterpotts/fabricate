class CraftingSystemDetails {

    private readonly _name: string;
    private readonly _summary: string;
    private readonly _description: string;
    private readonly _author: string;

    constructor({
        name,
        summary,
        description,
        author
    }: {
        name: string,
        summary: string,
        description: string,
        author: string
    }) {
        this._name = name;
        this._summary = summary;
        this._description = description;
        this._author = author;
    }

    get name(): string {
        return this._name;
    }

    get summary(): string {
        return this._summary;
    }

    get description(): string {
        return this._description;
    }

    get author(): string {
        return this._author;
    }

    public toDefinition(): {
        name: string,
        summary: string,
        description: string,
        author: string
    } {
        return {
            name: this._name,
            summary: this._summary,
            description: this._description,
            author: this._author
        }
    }

}

export { CraftingSystemDetails }