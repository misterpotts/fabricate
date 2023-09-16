/**
 * =====================================================================================================================
 * Foundry Dialog window type.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Dialog.html
 * =====================================================================================================================
 */
declare interface Dialog {

    confirm(options: { title: string; content: string }): Promise<boolean>;

}

declare const Dialog: Dialog;

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

    notifications: any;

}

declare const ui: UI;

declare interface FoundryI18NLocalization {

        localize(path: string): string;

        format(path: string, params: {}): string;

}

/**
 * =====================================================================================================================
 * Foundry Game global object accessed from the `globalThis` namespace (partially documented at
 * https://foundryvtt.com/api/v11/modules/client.globalThis.html#ui).
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Game.html
 * =====================================================================================================================
 */
declare interface Game {
    i18n: FoundryI18NLocalization;

}

declare const game: Game;

/**
 * =====================================================================================================================
 * Foundry Actor class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Actor.html
 * =====================================================================================================================
 */
declare interface Actor {

        id: string;

}

declare interface ApplicationOptions {

    id: string;

    template?: string;

    classes?: string[];

}

/**
 * =====================================================================================================================
 * Foundry Application class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/client.Application.html
 * =====================================================================================================================
 */
declare abstract class Application {

    options: ApplicationOptions;

    constructor(options: ApplicationOptions);

    close(): Promise<void>;

}

/**
 * =====================================================================================================================
 * Foundry Document class.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/classes/foundry.abstract.Document.html
 * =====================================================================================================================
 */
declare interface Document {

        id: string;

        getFlag(scope: string, key: string): any;

}

/**
 * =====================================================================================================================
 * Foundry Item class, a type of Document.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/modules/foundry.utils.html
 * - Document: https://foundryvtt.com/api/v11/classes/foundry.abstract.Document.html
 * =====================================================================================================================
 */
declare interface Item extends Document {

    isOwned: boolean;

}

declare interface ActiveEffect {}

/**
 * =====================================================================================================================
 * Foundry Utility Methods used by Fabricate.
 * Documentation for Foundry VTT V11 can be found at: https://foundryvtt.com/api/v11/modules/foundry.utils.html
 * =====================================================================================================================
 */

/**
 * Generate a random string ID of a given requested length.
 */
declare function randomID(length?: number): string;