interface Identity {
    value: string;
}

interface Identifiable<T extends Identity> {
    id: T;
}


export { Identifiable, Identity }