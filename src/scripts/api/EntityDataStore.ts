import {Identifiable} from "../common/Identifiable";
import {Serializable} from "../common/Serializable";

class EntityDataStore<J, T extends Identifiable & Serializable<J>> {

    private readonly entities: Map<string, T>;
    private readonly collections: Map<string, Set<string>>;
    private readonly _entityName: string;

    constructor({
        entityName = "Unnamed entity",
        entities = new Map(),
        collections = new Map()
    }: {
        entityName?: string;
        entities?: Map<string, T>;
        collections?: Map<string, Set<string>>;
    } = {}) {
        this.entities = entities;
        this.collections = collections;
        this._entityName = entityName;
    }

    get entityName(): string {
        return this._entityName;
    }

    public insertEntity(entity: T): void {
        this.entities.set(entity.id, entity);
    }

    public getEntity(id: string): T | undefined {
        return this.entities.get(id);
    }

    public deleteEntity(id: string): boolean {
        // Remove entity from all collections
        this.collections.forEach(collection => {
            collection.delete(id);
        });

        // Remove entity from the entities map
        return this.entities.delete(id);
    }

    public getAllEntities(): T[] {
        return Array.from(this.entities.values());
    }

    private getCollectionName(prefix: string, name: string) {
        return prefix + name;
    }

    public addToCollection(collectionName: string, entityId: string, collectionNamePrefix: string = ""): void {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        if (!this.collections.has(fullCollectionName)) {
            this.collections.set(fullCollectionName, new Set<string>());
        }
        const set = this.collections.get(fullCollectionName);
        if (set) {
            set.add(entityId);
        }
        if (!this.entities.has(entityId)) {
            console.warn(`The entity ID ${entityId} was added to the collection ${fullCollectionName} in the ${this.entityName} store, but the entity is not yet known to this store. You will need to either add the entity, or remove its ID from the collection`);
        }
    }

    public removeFromCollection(collectionName: string, entityId: string, collectionNamePrefix: string = ""): void {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        const collection = this.collections.get(fullCollectionName);
        if (collection) {
            collection.delete(entityId);
        }
    }

    public getCollection(collectionName: string, collectionNamePrefix: string = ""): T[] {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        const collection = this.collections.get(fullCollectionName);
        if (!collection) {
            return [];
        }
        return Array.from(collection.values())
            .map(id => this.entities.get(id));
    }

    public deleteCollection(collectionName: string, collectionNamePrefix: string = ""): boolean {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        const collection = this.collections.get(fullCollectionName);
        if (collection) {
            // Remove all entities with IDs that were members of the collection
            collection.forEach(entityId => {
                this.deleteEntity(entityId);
            });

            // Remove the collection
            return this.collections.delete(fullCollectionName);
        }
        return false;
    }

    public toJson(): string {
        const entitiesArray: T[] = this.getAllEntities();
        const collectionsObj: { [key: string]: string[] } = {};

        this.collections.forEach((collection, key) => {
            collectionsObj[key] = Array.from(collection.values());
        });

        const serializedData = {
            entities: entitiesArray.map(entity => entity.toJson()),
            collections: collectionsObj,
        };

        return JSON.stringify(serializedData);
    }

    public static fromJson<J, T extends Identifiable & Serializable<J>>(
        entityName: string,
        json: string,
        itemFactory: (itemData: any, ...args: any[]) => T,
        ...itemFactoryArgs: any[]
    ): EntityDataStore<J, T> {
        let parsedData;
        try {
            parsedData = JSON.parse(json);
        } catch (e) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`The data source for the ${entityName} store is not valid JSON`, { cause });
        }
        const dataStore = new EntityDataStore<J, T>({ entityName });

        if (!("entities" in parsedData)) {
            throw new Error(`The data source for the ${entityName} store is missing the required property "entities"`);
        }

        if (!("collections" in parsedData)) {
            throw new Error(`The data source for the ${entityName} store is missing the required property "collections"`);
        }

        // Add entities to the data store
        for (const itemData of parsedData.entities) {
            const newItem = itemFactory(itemData, ...itemFactoryArgs);
            dataStore.insertEntity(newItem);
        }

        // Add collections to the data store
        for (const collectionName in parsedData.collections) {
            const entityIds = parsedData.collections[collectionName];
            for (const entityId of entityIds) {
                dataStore.addToCollection(collectionName, entityId);
            }
        }

        return dataStore;
    }

}

export { EntityDataStore }