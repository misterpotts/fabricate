import Properties from "../../scripts/Properties";

interface ActorDetails {

    id: string;

    name: string;

    initials: string;

    avatarUrl: string;
    
    hasAvatarImage(): boolean;

}

export { ActorDetails };

class DefaultActorDetails implements ActorDetails {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _initials: string;
    private readonly _avatarUrl: string;

    constructor({
        id,
        name,
        initials,
        avatarUrl
    }: {
        id: string;
        name: string;
        initials: string;
        avatarUrl: string;
    }) {
        this._id = id;
        this._name = name;
        this._initials = initials;
        this._avatarUrl = avatarUrl;
    }

    get id(): string {
        return this._id;
    }

    get initials(): string {
        return this._initials;
    }

    get avatarUrl(): string {
        return this._avatarUrl;
    }

    get name(): string {
        return this._name;
    }

    hasAvatarImage(): boolean {
        if (!this._avatarUrl) {
            return false;
        }
        return this._avatarUrl !== Properties.ui.defaults.mysteryManImagePath;
    }

    /**
     * Returns the initials of a name. A name can be a single word or multiple words, but only the first and last words
     * are used to form the initials. Words are separated by spaces, and special characters are ignored. For example,
     * the initials for "John Doe" are "JD", the initials for "Jane-Anne Doe" are "JD", and the initials for "John Doe
     * Smith" are "JS".
     *
     * @param name The name to get the initials from.
     * @returns The initials of the name.
     */
    static getInitialsFromName(name: string) {
        if (!name) {
            return "?";
        }
        const wordFirstLetters = name.split(" ")
            .filter(word => !!word)
            .map(word => word[0]);
        const firstLetter = wordFirstLetters[0];
        const lastLetter = wordFirstLetters[wordFirstLetters.length - 1];
        return `${firstLetter}${lastLetter}`;
    }
}

export { DefaultActorDetails };

class NoActorDetails implements ActorDetails {

    get id(): string {
        return "";
    }

    get initials(): string {
        return "?";
    }

    get avatarUrl(): string {
        return "";
    }

    get name(): string {
        return "";
    }

    hasAvatarImage(): boolean {
        return false;
    }

}

export { NoActorDetails };