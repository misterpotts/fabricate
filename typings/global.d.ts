declare interface DialogButtonConfig {

    icon: string;

    label: string;

    callback?: (formHTML: any) => void;

}

/**
 * =====================================================================================================================
 * Foundry VTT Dialog class
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Dialog.html
 * =====================================================================================================================
 */
declare class Dialog {

    /**
     * Creates a new dialog window
     * https://foundryvtt.com/api/v11/classes/client.Dialog.html#constructor
     * @param data - Options which configure the dialog
     * @param data.title - The dialog window title
     * @param data.content - The dialog window body
     * @param data.buttons - Action buttons which should be displayed as part of the dialog
     * @param options - Additional rendering options which are applied to customize the way that the application is
     */
    constructor(data: {
        title: string;
        content: string,
        buttons: Record<string, DialogButtonConfig>;
        default: keyof typeof data.buttons;
    }, options: Partial<ApplicationOptions>);

    /**
     * Display a confirmation dialog modal which prompts the user to choose between two configurable choices.
     * https://foundryvtt.com/api/v11/classes/client.Dialog.html#confirm
     *
     * @param options - Options which configure the confirmation dialog
     * @param options.title - The confirmation window title
     * @param options.content - The confirmation window body
     * @param options.yes - Callback function upon yes
     * @param options.no - Callback function upon no
     * @param options.defaultYes - Whether yes should be the default choice
     */
    static confirm(options: { title: string; content: string, yes?: () => void, no?: () => void, defaultYes?: boolean }): Promise<boolean>;

    /**
     * Render the Application by evaluating its HTML template against the object of data provided by the getData method.
     * If the Application is rendered as a pop-out window, wrap the contained HTML in an outer frame with window
     * controls
     * https://foundryvtt.com/api/v11/classes/client.Dialog.html#render
     *
     * @param force - Force re-rendering the application
     * @param options - Additional rendering options which are applied to customize the way that the application is
     *  rendered
     */
    render(force: boolean, options?: ApplicationOptions): Promise<Application>;

}

/**
 * =====================================================================================================================
 * Foundry UI global object accessed from the `globalThis` namespace (partially documented at
 * https://foundryvtt.com/api/v11/modules/client.globalThis.html#ui). The UI object is primarily used by Fabricate for
 *displaying notifications to users.
 * Documentation for Foundry VTT V11 can be found at:
 * - Notifications: https://foundryvtt.com/api/v11/classes/client.Notifications.html
 * =====================================================================================================================
 * */
declare interface UI {

    windows: any[];

    notifications: any;

}

declare const ui: UI;

declare interface FoundryI18NLocalization {

    localize(path: string): string;

    format(path: string, params: {}): string;

}

/**
 * =====================================================================================================================
 * Foundry Actors class.
 * Documentation for Foundry VTT V11 can be found at:
 * https://foundryvtt.com/api/v11/classes/client.Actors.html
 * =====================================================================================================================
 */
declare interface Actors {

    get(actorId: string): Actor;

}

/**
 * =====================================================================================================================
 * Foundry User class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.User.html
 * =====================================================================================================================
 */
declare interface User {

    name: string;

    isGM: boolean;

    id: string;

}

/**
 * =====================================================================================================================
 * Foundry Game global object accessed from the `globalThis` namespace (partially documented at
 * https://foundryvtt.com/api/v11/modules/client.globalThis.html#ui).
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Game.html
 * =====================================================================================================================
 */
declare interface Game {

    user: User;

    settings: ClientSettings;

    system: {
        id: string;
    };

    actors: Actors;

    i18n: FoundryI18NLocalization;

}

declare const game: Game;

/**
 * =====================================================================================================================
 * Foundry Actor class.
 * Documentation for Foundry VTT V11 can be found at:
 * https://foundryvtt.com/api/v11/classes/foundry.abstract.EmbeddedCollection.html
 * =====================================================================================================================
 */
declare interface EmbeddedCollection<T extends Document> extends Map<string, T> {

}

/**
 * =====================================================================================================================
 * Foundry Actor class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Actor.html
 * =====================================================================================================================
 */
declare interface Actor {

    name: string;

    items: EmbeddedCollection<Item>;

    id: string;

}

/**
 * =====================================================================================================================
 * Foundry Application class constructor args.
 * What little documentation exists for these in Foundry VTT V11 can be found at:
 * https://foundryvtt.com/api/v11/classes/client.Application.html#options
 * =====================================================================================================================
 */
declare interface ApplicationOptions {

    id?: string;

    template?: string;

    title?: string;

    resizable?: boolean;

    classes?: string[];

    top?: number;

    left?: number;

    scale?: number;

    width?: number;

    height?: number;

}

/**
 * =====================================================================================================================
 * Foundry Application class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Application.html
 * =====================================================================================================================
 */
declare abstract class Application {

    options: ApplicationOptions;

    rendered: boolean;

    protected constructor(options: ApplicationOptions);

    close(): Promise<void>;

    render(force?: boolean, updatedOptions?: Partial<ApplicationOptions>): Promise<void>;

}

/**
 * =====================================================================================================================
 * Foundry Document class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/foundry.abstract.Document.html
 * =====================================================================================================================
 */
declare interface Document {

    documentName: string;

    id: string;

    actor?: Actor;

    getFlag(scope: string, key: string): any;

}

/**
 * =====================================================================================================================
 * Foundry Item class, a type of Document.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Item.html
 * =====================================================================================================================
 */
declare interface Item extends Document {

    isOwned: boolean;

}


/**
 * =====================================================================================================================
 * Foundry Active Effect class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.ActiveEffect.html
 * =====================================================================================================================
 */
declare interface ActiveEffect {}


/**
 * =====================================================================================================================
 * Foundry client Settings class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.ClientSettings.html
 * =====================================================================================================================
 */
declare interface ClientSettings {

    /**
     * The storage interfaces used for persisting settings Each storage interface shares the same API as
     *  window.localStorage
     */
    storage: Map<string, any>;

    /**
     * Get the value of a game setting for a certain namespace and setting key
     * https://foundryvtt.com/api/v11/classes/client.ClientSettings.html#get
     *
     * @param namespace - The namespace under which the setting is defined
     * @param key - The key name for the setting under the namespace
     * @returns any The data being retrieved from the setting key
     */
    get(namespace: string, key: string): any;

    /**
     * Set the value of a game setting for a certain namespace and setting key
     * https://foundryvtt.com/api/v11/classes/client.ClientSettings.html#set
     *
     * @param namespace - The namespace under which the setting is defined
     * @param key - The key name for the setting under the namespace
     * @param value - The data being saved to the setting key
     * @returns Promise<any> (Not documented)
     */
    set(namespace: string, key: string, value: any): Promise<any>;

    /**
     * Register a new game setting under this setting scope
     * https://foundryvtt.com/api/v11/classes/client.ClientSettings.html#register
     *
     * @param namespace - The namespace under which the setting is defined
     * @param key - The key name for the setting under the namespace
     * @param settingConfig - Configuration for setting data
     * @param settingConfig.name - The human-readable label for the setting displayed in the Settings configuration menu
     * @param settingConfig.hint - A hint or short description for the setting displayed in the Settings configuration menu
     * @param settingConfig.type - The data type for the setting value. Must be one of String, Number, Boolean, or Object
     * @param settingConfig.default - The default value for the setting
     * @param settingConfig.scope - The scope of the setting being registered. Must be `world`, `client`, or `user`
     * @param settingConfig.config - Whether the setting should be available in the Settings configuration view
     * @param settingConfig.range - An optional range of acceptable values for number settings. If range is specified,
     *  the resulting setting will be a range slider
     * @param settingConfig.choices - An optional object of acceptable string choices for select settings. If choices is
     *  specified, the resulting setting will be a select menu
     * @param settingConfig.onChange - A callback function that fires when the setting is changed
     * @param settingConfig.requiresReload - Whether the setting requires a full application reload to take effect.
     *  Defaults to false
     */
    register(namespace: string, key: string, settingConfig: {
        default: any;
        hint: string;
        scope: string;
        name: string;
        type: ObjectConstructor | StringConstructor | NumberConstructor | BooleanConstructor;
        config: boolean;
        choices?: Record<string, string>;
        range?: { min: number; max: number; step: number };
        onChange?: (value: any) => void;
        requiresReload?: boolean;
    }): void;
}

/**
 * =====================================================================================================================
 * Foundry Hooks API
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Hooks.html
 * =====================================================================================================================
 */

declare interface Hooks {

    /**
     * Register a callback handler for an event which is only triggered once the first time the event occurs. An alias
     * for Hooks.on with {once: true}
     * https://foundryvtt.com/api/v11/classes/client.Hooks.html#once
     *
     * @param hookName - The unique name of the hook being registered
     * @param callbackFunction - The callback function which should be triggered when the hook event occurs
     */
    once(hookName: string, callbackFunction: (...args: any[]) => void | Promise<void>): void;

    /**
     * Register a callback handler which is triggered when a hook is triggered. Hooks are named events which can be
     * triggered by calling Hooks.callAll or Hooks.call
     * https://foundryvtt.com/api/v11/classes/client.Hooks.html#on
     *
     * @param hookName - The unique name of the hook being registered
     * @param callbackFunction - The callback function which should be triggered when the hook event occurs
     * @param options - Optional arguments which configure the hook event
     * @param options.once - Whether to unregister the hook after it's been triggered once. Defaults to false
     */
    on(hookName: string, callbackFunction: (...args: any[]) => void | Promise<void>, options?: { once: boolean }): void;

    /**
     * Unregister a callback handler for a particular hook event
     * https://foundryvtt.com/api/v11/classes/client.Hooks.html#off
     *
     * @param hookName - The unique name of the hooked event
     * @param callbackFunction - The callback function to unregister
     */
    off(hookName: string, callbackFunction: (...args: any[]) => void | Promise<void>): void;

    /**
     * Call all hook listeners in the order in which they were registered Hooks called this way can not be handled by
     *  returning false and will always trigger every hook callback.
     * https://foundryvtt.com/api/v11/classes/client.Hooks.html#callAll
     *
     * @param hookName - The hook being triggered
     * @param args - Arguments passed to the hook callback functions
     */
    callAll(hookName: string, ...args: any[]): void;

    /**
     * Call hook listeners in the order in which they were registered. Continue calling hooks until either all have been
     * called or one returns false. Hook listeners which return false denote that the original event has been
     * adequately handled and no further hooks should be called.
     * https://foundryvtt.com/api/v11/classes/client.Hooks.html#call
     *
     * @param hookName - The hook being triggered
     * @param args - Arguments passed to the hook callback functions
     */
    call(hookName: string, ...args: any[]): void;

}

declare const Hooks: Hooks;

/**
 * =====================================================================================================================
 * Foundry ItemDirectory class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.ItemDirectory.html
 * =====================================================================================================================
 */
declare abstract class ItemDirectory {

}

declare interface ItemSheet {

    document: Document;

    actor?: Actor;

}

/**
 * =====================================================================================================================
 * Foundry Utility Methods used by Fabricate.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/modules/foundry.utils.html
 * =====================================================================================================================
 */

/**
 * Generate a random string ID of a given requested length.
 * https://foundryvtt.com/api/v11/modules/foundry.utils.html#randomID
 *
 * @param length - The length of the ID to generate.
 * @returns The generated ID.
 */
declare function randomID(length?: number): string;

/**
 * Gets a document by UUID asynchronously.
 * https://foundryvtt.com/api/v11/modules/client.html#fromUuid
 *
 * @async
 * @param uuid - The UUID of the document to get.
 * @returns A promise that resolves to the document.
 */
declare function fromUuid(uuid: string): Promise<Document>;


/**
 * Gets a document by UUID synchronously.
 * https://foundryvtt.com/api/v11/modules/client.html#fromUuidSync
 *
 * @param uuid - The UUID of the document to get.
 * @returns The document.
 */
declare function fromUuidSync(uuid: string): Document;

/**
 * A cheap data duplication trick which is relatively robust. For a subset of cases the deepClone function will offer
 * better performance.
 * https://foundryvtt.com/api/v11/modules/foundry.utils.html#duplicate
 *
 * @param original - The object to duplicate.
 * @returns The duplicated object.
 */
declare function duplicate(original: object): object;

/**
 * Merges a source object into a target object, returning a new object in the process.
 * https://foundryvtt.com/api/v11/modules/foundry.utils.html#mergeObject
 *
 * @param target - The target object to merge into.
 * @param source - The source object to merge from.
 * @param options - Additional options that configure the merge operation.
 * @param options.insertKeys - Whether to insert new top-level objects into the target object. Defaults to true.
 * @param options.insertValues - Whether to insert new top-level objects into the target object. Defaults to true.
 * @param options.overwrite - Whether to overwrite existing values in the target object. Defaults to true.
 * @param options.inplace - Whether to perform the merge in-place, mutating the target object. Defaults to false.
 * @param options.enforceTypes - Whether to enforce that the types of values in the source and target objects match.
 *  Defaults to false.
 * @param options.performDeletions - Whether to delete values in the target object that are null or undefined in the
 *  source object. Defaults to false.
 */
declare function mergeObject(target: object, source: object, options?: { insertKeys: boolean; insertValues: boolean; overwrite: boolean; recursive: boolean; inplace: boolean; enforceTypes: boolean; performDeletions: boolean }): object;

/**
 * A helper function which searches through an object to retrieve a value by a string key. The method also supports
 * arrays if the provided key is an integer index of the array. The string key supports the notation a.b.c which would
 * return object[a][b][c]
 * https://foundryvtt.com/api/v11/modules/foundry.utils.html#getProperty
 *
 * @param object - The object to retrieve the property from.
 * @param propertyPath - The path of the property to retrieve.
 * @returns The retrieved property value.
 */
declare function getProperty(object: object, propertyPath: string): any;

/**
 * A helper function which searches through an object to assign a value using a string key This string key supports the
 * notation a.b.c which would target object[a][b][c]
 * https://foundryvtt.com/api/v11/modules/foundry.utils.html#setProperty
 *
 * @param object - The object to assign the property to.
 * @param propertyPath - The path of the property to assign.
 * @param value - The value to assign.
 * @returns boolean Indicating whether the property was changed as a result of this operation.
 */
declare function setProperty(object: object, propertyPath: string, value: any): boolean;

/**
 * Get and render a template using provided data and handle the returned HTML Support asynchronous file template file
 * loading with a client-side caching layer
 * https://foundryvtt.com/api/v11/modules/client.html#renderTemplate
 *
 * Allows resolution of prototype methods and properties since this all occurs within the safety of the client.
 * @param template - The template path to load, a named template, or a precompiled template function.
 * @param data - The data object to use when rendering the template.
 * @returns A promise which resolves to the rendered HTML as a string.
 */
declare function renderTemplate(template: string, data: any): Promise<string>;

/**
 * Read text data from a user provided File object
 * https://foundryvtt.com/api/v11/modules/client.html#readTextFromFile
 *
 * @async
 * @param file - The File object to read
 * @returns A Promise which resolves to the loaded text data
 */
declare function readTextFromFile(file: File): Promise<string>;

/**
 * Save data to a file and automatically trigger a download to the client machine
 * https://foundryvtt.com/api/v11/modules/client.html#saveDataToFile
 *
 * @param data - The data to save
 * @param dataType - The type of data being saved
 * @param fileName - The name of the file being saved
 */
declare function saveDataToFile(data: string, dataType: string, fileName: string): void;

