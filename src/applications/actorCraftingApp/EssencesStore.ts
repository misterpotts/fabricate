import {get, Readable, Subscriber, Unsubscriber, writable, Writable} from "svelte/store";
import {Essence} from "../../scripts/crafting/essence/Essence";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import {ComponentsStore} from "./ComponentsStore";

class EssencesStore implements Readable<Map<string, Essence>> {

    private readonly _essences: Writable<Map<string, Essence>>;
    private readonly _components: ComponentsStore;
    private readonly _fabricateAPI: FabricateAPI;

    constructor({
        essences = new Map<string, Essence>(),
        components,
        fabricateAPI,
    }: {
        essences?: Map<string, Essence>;
        components: ComponentsStore;
        fabricateAPI: FabricateAPI;
    }) {
        this._essences = writable(essences);
        this._components = components;
        this._fabricateAPI = fabricateAPI;
        this.watchForNewComponents(this._components);
    }

    private watchForNewComponents(components: ComponentsStore) {
        components.subscribe((components) => {
            if (!components || components.size === 0) {
                return;
            }
            const knownEssences = get(this._essences);
            const newEssenceIds = Array.from(components.values())
                .flatMap(component => component.essences.members)
                .map(essenceReference => essenceReference.id)
                .filter(essenceId => !knownEssences.has(essenceId))
                .filter((value, index, array) => array.indexOf(value) === index);
            this._fabricateAPI.essences.getAllById(newEssenceIds)
                .then((newEssences) => {
                    return Promise.all(Array.from(newEssences.values()).map(essence => essence.load()));
                })
                .then((newLoadedEssences) => {
                    newLoadedEssences.forEach((essence) => {
                        knownEssences.set(essence.id, essence);
                    });
                    this._essences.set(knownEssences);
                });
        });
    }

    public async loadAll() {
        const allEssencesById = await this._fabricateAPI.essences.getAll();
        const allEssencesLoaded = await Promise.all(Array.from(allEssencesById.values()).map(essence => essence.load()));
        allEssencesLoaded.forEach((essence) => {
            allEssencesById.set(essence.id, essence);
        });
        this._essences.set(allEssencesById);
    }

    public async add(essence: Essence) {
        const loadedEssence = await essence.load(true);
        this._essences.update((storedEssences) => {
            storedEssences.set(loadedEssence.id, loadedEssence);
            return storedEssences;
        });
    }

    public async addAll(essencesToAdd: Essence[]) {
        const loadedEssences = await Promise.all(essencesToAdd.map(essence => essence.load(true)));
        this._essences.update((storedEssences) => {
            loadedEssences.forEach((component) => {
                storedEssences.set(component.id, component);
            });
            return storedEssences;
        });
    }

    public async remove(essence: Essence) {
        this._essences.update((storedEssences) => {
            storedEssences.delete(essence.id);
            return storedEssences;
        });
    }

    public async removeAll(essencesToDelete: Essence[]) {
        this._essences.update((storedEssences) => {
            essencesToDelete.forEach((component) => {
                storedEssences.delete(component.id);
            });
            return storedEssences;
        });
    }

    subscribe(subscriber: Subscriber<Map<string, Essence>>): Unsubscriber {
        return this._essences.subscribe(subscriber);
    }



}

export { EssencesStore };