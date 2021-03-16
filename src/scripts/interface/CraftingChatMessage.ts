import {FabricationOutcome} from "../core/FabricationOutcome";
import {InventoryModification} from "../game/Inventory";
import {CraftingComponent} from "../core/CraftingComponent";

class CraftingChatMessage {

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

    constructor(cardTitle: string, cardContent: string, displayItems: InventoryModification<CraftingComponent>[], cardFooterParts: string[], cardImageUrl?: string, cardImagetitle?: string) {
        this._cardTitle = cardTitle;
        this._cardContent = cardContent;
        this._addedItems = displayItems;
        this._cardFooterParts = cardFooterParts;
        this._cardImageUrl = cardImageUrl;
        this._cardImageTitle = cardImagetitle;
    }

    public static fromFabricationOutcome(outcome: FabricationOutcome): CraftingChatMessage {
        return new CraftingChatMessage(outcome.title, outcome.description, outcome.addedItems, ['<span>Removed: </span>'].concat(outcome.removedComponents));
    }

    public render(): string {
        return `<div class="chat-card dnd5e fabricate-card">
            <header class="card-header flexrow">
                <img src="${this.cardImageUrl}" title="${this.cardImageTitle}" width="36" height="36" />
                <h3>${this.title}</h3>
            </header>
            <div class="card-content">
                ${this.content}
            </div>
            <div class="card-footer">
                ${this.footer}
            </div>
        </div>`;
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

    get content() {
        const summary: string = `<p>${this._cardContent}<p>`;
        if (!this._addedItems || this._addedItems.length === 0) {
            return summary;
        }
        const itemImages: string = this._addedItems
            .map((added: InventoryModification<CraftingComponent>) => {
                return `<li><div class="component">
                    <span class="quantity">${added.quantityChanged}</span>
                    <span class="name">${added.updatedRecord.fabricateItem.name}</span>
                        <img src="${added.updatedRecord.fabricateItem.imageUrl}" title="${added.updatedRecord.fabricateItem.name}"/>
                </div></li>`
            })
            .join('');
        return summary + `<p>The following items were added to your inventory:</p><div class="fabricate-components"><ul>${itemImages}</ul></div>`
    }

    get title(): string {
        return this._cardTitle
    }

    get footer() {
        return this._cardFooterParts
            .map((footerPart) => {
                return`<span>${footerPart}</span>`
            })
            .join('');
    }

}

export {CraftingChatMessage}