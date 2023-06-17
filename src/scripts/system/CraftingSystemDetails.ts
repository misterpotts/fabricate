interface CraftingSystemDetailsJson {
    name: string;
    summary: string;
    description: string;
    author: string;
}

class CraftingSystemDetails {

    private _name: string;
    private _summary: string;
    private _description: string;
    private _author: string;

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

    set name(value: string) {
        this._name = value;
    }

    set summary(value: string) {
        this._summary = value;
    }

    set description(value: string) {
        this._description = value;
    }

    set author(value: string) {
        this._author = value;
    }

    public toJson(): CraftingSystemDetailsJson {
        return {
            name: this._name,
            summary: this._summary,
            description: this._description,
            author: this._author
        }
    }

    clone(name?: string): CraftingSystemDetails {
        return new CraftingSystemDetails({
            name: name ?? this._name,
            summary: this._summary,
            description: this._description,
            author: this._author
        });
    }

}

export { CraftingSystemDetails, CraftingSystemDetailsJson }