import {Identifiable} from "../common/Identifiable";
import {Serializable} from "../common/Serializable";
import {EntityFactory} from "./EntityFactory";

interface SerialisedEntityData<J> {

    entities: J[];

    collections: Record<string, string[]>;

}

class EntityDataStore<J extends {}, T extends Identifiable & Serializable<J>> {

    private readonly entitiesJsonById: Map<string, J>;
    private readonly entityFactory: EntityFactory<J, T>;
    private readonly collections: Map<string, Set<string>>;
    private readonly _entityName: string;

    constructor({
        entityName = "Unnamed entity",
        entitiesJsonById = new Map(),
        collections = new Map(),
        entityFactory
    }: {
        entityName?: string;
        entitiesJsonById?: Map<string, J>;
        collections?: Map<string, Set<string>>;
        entityFactory: EntityFactory<J, T>;
    }) {
        this.entitiesJsonById = entitiesJsonById;
        this.collections = collections;
        this._entityName = entityName;
        this.entityFactory = entityFactory;
    }

    get entityName(): string {
        return this._entityName;
    }

    get size(): number {
        return this.entitiesJsonById.size;
    }

    get collectionCount(): number {
        return this.collections.size;
    }

    public insertEntity(entity: T): void {
        this.entitiesJsonById.set(entity.id, entity.toJson());
    }

    public getEntity(id: string): T | undefined {
        if (!this.entitiesJsonById.has(id)) {
            return undefined;
        }
        return this.entityFactory.make(this.entitiesJsonById.get(id));
    }

    public deleteEntity(id: string): boolean {
        // Remove entity from all collections
        this.collections.forEach(collection => {
            collection.delete(id);
        });

        // Remove entity from the entities map
        return this.entitiesJsonById.delete(id);
    }

    public getAllEntities(): T[] {
        return Array.from(this.entitiesJsonById.values())
            .map(entityJson => this.entityFactory.make(entityJson));
    }

    private getCollectionName(prefix: string, name: string) {
        return prefix + name;
    }

    public addToCollection(entityId: string, collectionName: string, collectionNamePrefix: string = ""): void {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        if (!this.collections.has(fullCollectionName)) {
            this.collections.set(fullCollectionName, new Set<string>());
        }
        const set = this.collections.get(fullCollectionName);
        if (set) {
            set.add(entityId);
        }
        if (!this.entitiesJsonById.has(entityId)) {
            console.warn(`The entity ID ${entityId} was added to the collection ${fullCollectionName} in the ${this.entityName} store, but the entity is not yet known to this store. You will need to either add the entity, or remove its ID from the collection`);
        }
    }

    public removeFromCollection(entityId: string, collectionName: string, collectionNamePrefix: string = ""): boolean {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        const collection = this.collections.get(fullCollectionName);
        if (collection) {
            return collection.delete(entityId);
        }
        return false;
    }

    public getCollection(collectionName: string, collectionNamePrefix: string = ""): T[] {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        const collection = this.collections.get(fullCollectionName);
        if (!collection) {
            return [];
        }
        return Array.from(collection.values())
            .map(id => this.entitiesJsonById.get(id))
            .map(entityJson => {
                if (!entityJson) {
                    return undefined;
                }
                return this.entityFactory.make(entityJson)
            });
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
            if (collection.size > 0) {
                collectionsObj[key] = Array.from(collection.values());
            }
        });

        const serializedData = {
            entities: entitiesArray.map(entity => entity.toJson()),
            collections: collectionsObj,
        };

        return JSON.stringify(serializedData);
    }

    public static fromJson<J extends {}, T extends Identifiable & Serializable<J>>(
        entityName: string,
        json: string,
        entityFactory: EntityFactory<J, T>
    ): EntityDataStore<J, T> {
        let parsedData: SerialisedEntityData<J>;
        try {
            parsedData = JSON.parse(json);
        } catch (e) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) :new Error("An unknown error occurred");
            throw new Error(`The data source for the ${entityName} store is not valid JSON`, { cause });
        }

        if (!("entities" in parsedData)) {
            throw new Error(`The data source for the ${entityName} store is missing the required property "entities"`);
        }

        if (!("collections" in parsedData)) {
            throw new Error(`The data source for the ${entityName} store is missing the required property "collections"`);
        }

        // Prepare entities JSON to initialise the data store
        const entitiesJsonById= new Map(parsedData.entities
            .map(entityJson => {
                if ("id" in entityJson) {
                    return [entityJson.id as string, entityJson as J];
                }
                throw new Error(`Entity JSON missing required property "id"`);
            }));

        const dataStore = new EntityDataStore<J, T>({ entityName, entitiesJsonById, entityFactory });

        // Add collections to the data store
        for (const collectionName in parsedData.collections) {
            const entityIds = parsedData.collections[collectionName];
            for (const entityId of entityIds) {
                dataStore.addToCollection(entityId, collectionName);
            }
        }

        return dataStore;
    }

}

export { EntityDataStore, SerialisedEntityData }