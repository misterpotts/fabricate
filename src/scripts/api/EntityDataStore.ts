import {Identifiable} from "../common/Identifiable";
import {Serializable} from "../common/Serializable";
import {EntityFactory} from "./EntityFactory";
import {SettingManager} from "./SettingManager";
import {CollectionManager, NoCollectionManager} from "./CollectionManager";

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
        const storedData = await this.settingManager.read();
        return Object.keys(storedData.entities).length;
    }

    async collectionCount(): Promise<number> {
        const storedData = await this.settingManager.read();
        return Object.keys(storedData.collections).length;
    }

    async create(entityJson: J): Promise<T> {
        const entity = await this.entityFactory.make(entityJson);
        await this.insert(entity);
        return entity;
    }

    async insert(entity: T): Promise<void> {
        const storedData = await this.settingManager.read();
        storedData.entities[entity.id] = entity.toJson();
        const collectionMemberships = this.collectionManager.listCollectionMemberships(entity.toJson());
        collectionMemberships.forEach(({ name, prefix }) => {
            this.addToCollection(entity.id, name, prefix, storedData);
        });
        await this.settingManager.write(storedData);
    }

    async getById(id: string): Promise<T | undefined> {
        const storedData = await this.settingManager.read();
        const entityJson = storedData.entities[id];
        if (!entityJson) {
            return undefined;
        }
        return this.entityFactory.make(entityJson);
    }

    async has(id: string): Promise<boolean> {
        const storedData = await this.settingManager.read();
        return !!storedData.entities[id];
    }

    async deleteById(id: string): Promise<boolean> {
        const storedData = await this.settingManager.read();
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
        const storedData = await this.settingManager.read();
        return Promise.all(
            Object.values(storedData.entities)
                .map(entityJson => this.entityFactory.make(entityJson))
        );
    }

    private getCollectionName(prefix: string, name: string) {
        return `${prefix}.${name}`;
    }

    private addToCollection(entityId: string, collectionName: string, collectionNamePrefix: string = "", storedData: SerialisedEntityData<J>): void {
        if (!storedData.entities[entityId]) {
            throw new Error(`Entity with ID ${entityId} does not exist. You must save an entity before adding it to a collection.`);
        }
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        if (!storedData.collections[fullCollectionName]) {
            storedData.collections[fullCollectionName] = [];
        }
        storedData.collections[fullCollectionName].push(entityId);
    }

    private removeFromCollection(entityId: string, collectionName: string, collectionNamePrefix: string = "", storedData: SerialisedEntityData<J>): boolean {
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
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
        const storedData = await this.settingManager.read();
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        const collection = storedData.collections[fullCollectionName];
        if (!collection) {
            return [];
        }
        return Promise.all(
            collection.map(entityId => this.entityFactory.make(storedData.entities[entityId]))
        );
    }

    async listAllEntityIds(): Promise<string[]> {
        const storedData = await this.settingManager.read();
        return Object.keys(storedData.entities);
    }

    /**
     * Removes a collection, its members, and all references to its members from other collections
     *
     * @async
     * @param collectionName The name of the collection to delete
     * @param collectionNamePrefix The prefix of the collection to delete
     * @returns A promise that resolves when the collection has been deleted
     * */
    async deleteCollection(collectionName: string, collectionNamePrefix: string = ""): Promise<void> {
        const storedData = await this.settingManager.read();
        const fullCollectionName = this.getCollectionName(collectionNamePrefix, collectionName);
        const idsToDelete = storedData.collections[fullCollectionName];
        if (!idsToDelete || idsToDelete.length === 0) {
            return;
        }

        // Remove the ids from other collections
        Object.keys(storedData.collections).forEach(collectionName => {
            const collection = storedData.collections[collectionName];
            if (!collection) {
                return;
            }
            storedData.collections[collectionName] = collection.filter(id => idsToDelete.indexOf(id) !== -1);
        });

        // remove the collection
        delete storedData.collections[fullCollectionName];

        // remove the entities
        idsToDelete.forEach(id => {
            delete storedData.entities[id];
        });

    }

    async getAllById(ids: string[]): Promise<T[]> {
        const storedData = await this.settingManager.read();
        return Promise.all(
            ids.filter(id => !!storedData.entities[id])
                .map(id => this.entityFactory.make(storedData.entities[id]))
        );
    }

    async updateAll(entities: T[]): Promise<void> {
        const storedData = await this.settingManager.read();
        entities.forEach(entity => {
            storedData.entities[entity.id] = entity.toJson();
        });
        await this.settingManager.write(storedData);
    }

}

export { EntityDataStore }