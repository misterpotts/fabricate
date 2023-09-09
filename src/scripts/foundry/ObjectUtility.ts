interface ObjectUtility {

    duplicate<T extends {}>(source: T): T;

    merge<T extends object>(target: T, source: T): T;

    getPropertyValue<T>(propertyPath: string, object: object): T;

    setPropertyValue<T>(propertyPath: string, object: object, value: T): void;

}

class DefaultObjectUtility implements ObjectUtility {

    duplicate<T extends {}>(source: T): T {
        return duplicate(source) as T;
    }

    merge<T extends object>(target: T, source: T): T {
        return mergeObject(target, source) as T;
    }

    getPropertyValue<T>(propertyPath: string, object: object): T {
        return getProperty(object, propertyPath) as T;
    }

    setPropertyValue<T>(propertyPath: string, object: object, value: T): void {
        setProperty(object, propertyPath, value);
    }

}

export { ObjectUtility, DefaultObjectUtility }