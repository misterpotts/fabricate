interface Identifiable {
    id: string;
}

export { Identifiable };

class Nothing implements Identifiable {

    private static readonly _ID = "NO_ID";

    get id(): string {
        return Nothing._ID;
    }

}

export { Nothing };