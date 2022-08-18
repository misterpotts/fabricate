class ObjectUtility {

    public duplicate<T extends {}>(source: T): T {
        return duplicate(source) as T;
    }

    public merge<T extends object>(target: T, source: T): T {
        return mergeObject(target, source) as T;
    }

}

export {ObjectUtility}