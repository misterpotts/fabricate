import {FabricationOutcome} from "../core/FabricationOutcome";

class CraftingChatMessage {

    private readonly _outcome: FabricationOutcome;
    private readonly _fabricateFireIconUrl = 'modules/fabricate/assets/fabricate-fire.png';
    private readonly _fabricateEarthIconUrl = 'modules/fabricate/assets/fabricate-earth.png';
    private readonly _fabricateWaterIconUrl = 'modules/fabricate/assets/fabricate-water.png';
    private readonly _fabricateAirIconUrl = 'modules/fabricate/assets/fabricate-air.png';
    private readonly _images: string[] = [this._fabricateFireIconUrl, this._fabricateEarthIconUrl, this._fabricateWaterIconUrl, this._fabricateAirIconUrl];

    constructor(outcome: FabricationOutcome) {
        this._outcome = outcome;
    }

    public render(): string {
        return `<div class="chat-card dnd5e">
            <header class="card-header flexrow">
                <img src="${this.cardImageUrl}" title="${this.cardImageTitle}" width="36" height="36">
                <h3>${this.title}</h3>
            </header>
            <div class="card-content">
                ${this.content}
            </div>
            <div class="card-footer">
                ${this.consumedComponents}
            </div>
        </div>`;
    }

    get cardImageUrl() {
        const selectedImageIndex = Math.floor(Math.random() * (this._images.length + 1));
        return this._images[selectedImageIndex];
    }

    get cardImageTitle(): string {
        return 'Fabricate';
    }

    get content() {
        return this._outcome.description;
    }

    get title(): string {
        return this._outcome.title;
    }

    get consumedComponents() {
        return this._outcome.removedComponents
            .map((removedComponent) => {
                return`<span>${removedComponent.quantity} ${removedComponent.name}</span>`
            })
            .join();
    }

}

export {CraftingChatMessage}