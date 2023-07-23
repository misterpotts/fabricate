import {SettingManager} from "./SettingManager";
import {CollectionManager, NoCollectionManager} from "./CollectionManager";
import {Identifiable} from "../common/Identifiable";
import {Serializable} from "../common/Serializable";
import {EntityFactory} from "./EntityFactory";

interface SerialisedEntityData<J> {

    entities: Record<string, J>;

    collections: Record<string, string[]>;

}

export { SerialisedEntityData }

class EntityDataStore<J extends { id: string }, T extends Identifiable & Serializable<J>> {

    private readonly collectionManager: CollectionManager<J>;
    private readonly entityFactory: EntityFactory<J, T>;
    private readonly _entityName: string;
    private readonly settingManager: SettingManager<SerialisedEntityData<J>>;

    constructor({
        entityName = "Unnamed entity",
        entityFactory,
        collectionManager = NoCollectionManager.INSTANCE,
        settingManager
    }: {
        entityName?: string;
        entityFactory: EntityFactory<J, T>;
        collectionManager?: CollectionManager<J>;
        settingManager: SettingManager<SerialisedEntityData<J>>;
    }) {
        this._entityName = entityName;
        this.entityFactory = entityFactory;
        this.collectionManager = collectionManager;
        this.settingManager = settingManager;
    }

    get entityName(): string {
        return this._entityName;
    }

    async size(): Promise<number> {
        const storedData = await this.getStoredData();
        return Object.keys(storedData.entities).length;
    }

    async collectionCount(): Promise<number> {
        const storedData = await this.getStoredData();
        return Object.keys(storedData.collections).length;
    }

    async create(entityJson: J): Promise<T> {
        const entity = await this.buildEntity(entityJson);
        await this.insert(entity);
        return entity;
    }

    async insert(entity: T): Promise<T> {
        const storedData = await this.getStoredData();
        storedData.entities[entity.id] = entity.toJson();
        const collectionMemberships = this.collectionManager.listCollectionMemberships(entity.toJson());
        collectionMemberships.forEach(({ name, prefix }) => {
            this.addToCollection(entity.id, name, prefix, storedData);
        });
        await this.settingManager.write(storedData);
        return entity;
    }

    async insertAll(entities: T[]): Promise<T[]> {
        const storedData = await this.getStoredData();
        entities.forEach(entity => {
            storedData.entities[entity.id] = entity.toJson();
            const collectionMemberships = this.collectionManager.listCollectionMemberships(entity.toJson());
            collectionMemberships.forEach(({ name, prefix }) => {
                this.addToCollection(entity.id, name, prefix, storedData);
            });
        });
        await this.settingManager.write(storedData);
        return entities;
    }

    async getById(id: string): Promise<T | undefined> {
        const storedData = await this.getStoredData();
        const entityJson = storedData.entities[id];
        if (!entityJson) {
            return undefined;
        }
        return await this.buildEntity(entityJson);
    }

    public async buildEntity(entityJson: Record<string, J>[string]): Promise<T> {
        const entity = await this.entityFactory.make(entityJson);
        if (!entity) {
            throw new Error(`Failed to create ${this.entityName} from JSON: ${JSON.stringify(entityJson)}. `);
        }
        return entity;
    }

    async has(id: string): Promise<boolean> {
        const storedData = await this.getStoredData();
        return !!storedData.entities[id];
    }

    async deleteById(id: string): Promise<boolean> {
        const storedData = await this.getStoredData();
        const entityJson = storedData.entities[id];
        if (!entityJson) {
            return false;
        }

        const collectionMemberships = this.collectionManager.listCollectionMemberships(entityJson);

        collectionMemberships.forEach(({ name, prefix }) => {
            this.removeFromCollection(entityJson.id, name, prefix, storedData);
        });

        delete storedData.entities[id];
        await this.settingManager.write(storedData);
        return true;
    }

    async getAllEntities(): Promise<T[]> {
        const storedData = await this.getStoredData();
        return Promise.all(
            Object.values(storedData.entities)
                .map(entityJson => this.buildEntity(entityJson))
        );
    }

    private getCollectionName(name: string, prefix: string = "") {
        if (!prefix || prefix === "") {
            return name;
        }
        return `${prefix}.${name}`;
    }

    private addToCollection(entityId: string, collectionName: string, collectionNamePrefix: string = "", storedData: SerialisedEntityData<J>): void {
        if (!storedData.entities[entityId]) {
            throw new Error(`Entity with ID ${entityId} does not exist. You must save an entity before adding it to a collection.`);
        }
        const fullCollectionName = this.getCollectionName(collectionName, collectionNamePrefix);
        if (!storedData.collections[fullCollectionName]) {
            storedData.collections[fullCollectionName] = [];
        }
        storedData.collections[fullCollectionName].push(entityId);
    }

    private removeFromCollection(entityId: string, collectionName: string, collectionNamePrefix: string = "", storedData: SerialisedEntityData<J>): boolean {
        const fullCollectionName = this.getCollectionName(collectionName, collectionNamePrefix);
        const collection = storedData.collections[fullCollectionName];
        if (!collection) {
            return false;
        }
        if (collection.indexOf(entityId) === -1) {
            return false;
        }
        collection.splice(collection.indexOf(entityId), 1);
        return true;
    }

    async getCollection(collectionName: string, collectionNamePrefix: string = ""): Promise<T[]> {
        const storedData = await this.getStoredData();
        const fullCollectionName = this.getCollectionName(collectionName, collectionNamePrefix);
        const collection = storedData.collections[fullCollectionName];
        if (!collection) {
            return [];
        }
        return Promise.all(
            collection.map(entityId => this.buildEntity(storedData.entities[entityId]))
        );
    }

    async listAllEntityIds(): Promise<string[]> {
        const storedData = await this.getStoredData();
        return Object.keys(storedData.entities);
    }

    async listCollectionEntityIds(collectionName: string, collectionNamePrefix: string = ""): Promise<string[]> {
        const storedData = await this.getStoredData();
        const fullCollectionName = this.getCollectionName(collectionName, collectionNamePrefix);
        if (!storedData.collections[fullCollectionName]) {
            return [];
        }
        return storedData.collections[fullCollectionName];
    }

    /**
     * Removes a collection, its members, and all references to its members from other collections
     *
     * @async
     * @param collectionName The name of the collection to delete
     * @param collectionNamePrefix The prefix of the collection to delete
     * @returns A promise that resolves to true if the collection and its members were deleted, or false if it did not
     *   exist
     * */
    async deleteCollection(collectionName: string, collectionNamePrefix: string = ""): Promise<boolean> {
        const storedData = await this.getStoredData();
        const fullCollectionName = this.getCollectionName(collectionName, collectionNamePrefix);
        const idsToDelete = storedData.collections[fullCollectionName];
        if (!idsToDelete || idsToDelete.length === 0) {
            return false;
        }

        // remove the collection
        delete storedData.collections[fullCollectionName];

        // Remove the ids from other collections
        Object.keys(storedData.collections)
            .forEach(collectionName => {
                storedData.collections[collectionName] = storedData.collections[collectionName]
                    .filter(id => !idsToDelete.includes(id));
            });

        // remove the entities
        idsToDelete.forEach(id => {
            delete storedData.entities[id];
        });

        await this.settingManager.write(storedData);
        return true;
    }

    async getAllById(ids: string[]): Promise<T[]> {
        const storedData = await this.getStoredData();
        return Promise.all(
            ids.filter(id => !!storedData.entities[id])
                .map(id => this.buildEntity(storedData.entities[id]))
        );
    }

    async updateAll(entities: T[]): Promise<void> {
        const storedData = await this.getStoredData();
        entities.forEach(entity => {
            storedData.entities[entity.id] = entity.toJson();
        });
        await this.settingManager.write(storedData);
    }

    private async getStoredData(): Promise<SerialisedEntityData<J>> {
        // call settingManager.read() and assert it has the properties `entities` and `collections` before returning
        const storedData = await this.settingManager.read();
        if (!storedData.entities && !storedData.collections) {
            throw new Error(`The settings value at "${this.settingManager.settingPath}" for the ${this.entityName} data store is missing both of the required "entities" and "collections" properties`);
        }
        if (!storedData.entities) {
            throw new Error(`The settings value at "${this.settingManager.settingPath}" for the ${this.entityName} data store is missing the required "entities" property`);
        }
        if (!storedData.collections) {
            throw new Error(`The settings value at "${this.settingManager.settingPath}" for the ${this.entityName} data store is missing the required "collections" property`);
        }
        return storedData;
    }

}

export { EntityDataStore }