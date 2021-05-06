class Tool {
    /**
     * The value to use in the User Interface when displaying and describing the tool
     * */
    private readonly _displayName: string;

    /**
     * The value to look for when checking if an Actor for a matching tool proficiency
     * */
    private readonly _proficiencyLabel: string;

    /**
     * Creates a new Tool
     * */
    constructor(name: string, proficiencyLabel: string) {
        this._displayName = name;
        this._proficiencyLabel = proficiencyLabel;
    }

    /**
     * The value to use in the User Interface when displaying and describing the tool
     * */
    get displayName(): string {
        return this._displayName;
    }

    /**
     * The value to look for when checking if an Actor for a matching tool proficiency
     * */
    get proficiencyLabel(): string {
        return this._proficiencyLabel;
    }
}

export {Tool};