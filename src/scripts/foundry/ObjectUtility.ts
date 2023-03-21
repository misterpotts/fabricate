interface ObjectUtility {

    duplicate<T extends {}>(source: T): T;

    merge<T extends object>(target: T, source: T): T;

}

class DefaultObjectUtility implements ObjectUtility {

    duplicate<T extends {}>(source: T): T {
        return duplicate(source) as T;
    }

    merge<T extends object>(target: T, source: T): T {
        return mergeObject(target, source) as T;
    }

}

export { ObjectUtility, DefaultObjectUtility }