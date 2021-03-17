import {FabricationOutcome} from "../core/FabricationOutcome";
import {InventoryModification} from "../game/Inventory";
import {CraftingComponent} from "../core/CraftingComponent";

class CraftingChatMessage {

    private static readonly _fabricateErrorIconUrl = 'modules/fabricate/assets/caution.svg';
    private static readonly _fabricateFireIconUrl = 'modules/fabricate/assets/fabricate-fire.png';
    private static readonly _fabricateEarthIconUrl = 'modules/fabricate/assets/fabricate-earth.png';
    private static readonly _fabricateWaterIconUrl = 'modules/fabricate/assets/fabricate-water.png';
    private static readonly _fabricateAirIconUrl = 'modules/fabricate/assets/fabricate-air.png';
    private static readonly _defaultImages: string[] = [
        CraftingChatMessage._fabricateFireIconUrl,
        CraftingChatMessage._fabricateEarthIconUrl,
        CraftingChatMessage._fabricateWaterIconUrl,
        CraftingChatMessage._fabricateAirIconUrl
    ];

    private readonly _cardTitle: string;
    private readonly _cardContent: string;
    private readonly _cardFooterParts: string[];
    private readonly _addedItems: InventoryModification<CraftingComponent>[];
    private readonly _cardImageUrl: string;
    private readonly _cardImageTitle: string;

    constructor(cardTitle: string, cardContent: string, cardFooterParts: string[], addedItems?: InventoryModification<CraftingComponent>[], cardImageUrl?: string, cardImageTitle?: string) {
        this._cardTitle = cardTitle;
        this._cardContent = cardContent;
        this._addedItems = addedItems;
        this._cardFooterParts = cardFooterParts;
        this._cardImageUrl = cardImageUrl;
        this._cardImageTitle = cardImageTitle;
    }

    public static fromFabricationError(error: Error) {
        return new CraftingChatMessage('Crafting error', error.message, [], [], CraftingChatMessage._fabricateErrorIconUrl, 'Something went wrong');
    }

    public static fromFabricationOutcome(outcome: FabricationOutcome): CraftingChatMessage {
        const footerParts: string[] = ['Removed:'].concat(outcome.removedComponents);
        return new CraftingChatMessage(outcome.title, outcome.description, footerParts, outcome.addedItems);
    }

    get cardImageUrl() {
        if (this._cardImageUrl) {
            return this._cardImageUrl;
        }
        const selectedImageIndex = Math.floor(Math.random() * CraftingChatMessage._defaultImages.length);
        return CraftingChatMessage._defaultImages[selectedImageIndex];
    }

    get cardImageTitle(): string {
        if (this._cardImageTitle) {
            return this._cardImageTitle;
        }
        return 'Fabricate Crafting';
    }

    get cardTitle(): string {
        return this._cardTitle
    }

    get footerParts() {
        return this._cardFooterParts;
    }

    get description() {
        return this._cardContent;
    }

    get results() {
        return this._addedItems;
    }

    get hasResults(): boolean {
        return this._addedItems && this._addedItems.length > 0;
    }

}

export {CraftingChatMessage}