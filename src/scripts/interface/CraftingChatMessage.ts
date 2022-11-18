import Properties from "../Properties";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {GameProvider} from "../foundry/GameProvider";

enum IconType {
    ERROR,
    FAILURE,
    FIRE,
    EARTH,
    WATER,
    AIR,
    RANDOM
}

interface CraftingChatMessageConfig {
    iconType: IconType;
    description: string;
    title?: string;
    createdItems?: Combination<CraftingComponent>;
    consumedItems?: Combination<CraftingComponent>;
}

class CraftingChatMessage {

    private static readonly _unexpectedErrorIconUrl = 'modules/fabricate/assets/caution.svg';

    private static readonly _craftingFailureIconUrl = 'modules/fabricate/assets/fabricate-error.png';

    private static readonly _fabricateFireIconUrl = 'modules/fabricate/assets/fabricate-fire.png';
    private static readonly _fabricateEarthIconUrl = 'modules/fabricate/assets/fabricate-earth.png';
    private static readonly _fabricateWaterIconUrl = 'modules/fabricate/assets/fabricate-water.png';
    private static readonly _fabricateAirIconUrl = 'modules/fabricate/assets/fabricate-air.png';

    private static readonly _defaultTitle = 'Crafting Result';

    private static readonly _defaultImages: string[] = [
        CraftingChatMessage._fabricateFireIconUrl,
        CraftingChatMessage._fabricateEarthIconUrl,
        CraftingChatMessage._fabricateWaterIconUrl,
        CraftingChatMessage._fabricateAirIconUrl
    ];

    private readonly _title: string;
    private readonly _description: string;
    private readonly _createdItems: Combination<CraftingComponent>;
    private readonly _consumedItems: Combination<CraftingComponent>;
    private readonly _iconType;

    constructor(config: CraftingChatMessageConfig) {
        this._title = config.title;
        this._description = config.description;
        this._createdItems = config.createdItems;
        this._consumedItems = config.consumedItems;
        this._iconType = config.iconType;
    }

    get iconUrl() {
        switch (this._iconType) {
            case IconType.RANDOM:
                return CraftingChatMessage.randomCardImageUrl
            case IconType.ERROR:
                return CraftingChatMessage._unexpectedErrorIconUrl;
            case IconType.FAILURE:
                return CraftingChatMessage._craftingFailureIconUrl;
            case IconType.EARTH:
                return CraftingChatMessage._fabricateEarthIconUrl;
            case IconType.AIR:
                return CraftingChatMessage._fabricateAirIconUrl;
            case IconType.WATER:
                return CraftingChatMessage._fabricateWaterIconUrl;
            case IconType.FIRE:
                return CraftingChatMessage._fabricateFireIconUrl;
        }
    }

    static get randomCardImageUrl() {
        const selectedImageIndex = Math.floor(Math.random() * CraftingChatMessage._defaultImages.length);
        return CraftingChatMessage._defaultImages[selectedImageIndex];
    }

    get iconTitle(): string {
        return CraftingChatMessage._defaultTitle;
    }

    get title(): string {
        return this._title ? this._title : CraftingChatMessage._defaultTitle;
    }

    get footer() {
        return this._consumedItems.units.map(unit => `${unit.quantity} ${unit.part.name}`);
    }

    get description() {
        return this._description;
    }

    get results() {
        return this._createdItems.units.map(unit => ({
            key: unit.part.name,
            imageUrl: unit.part.imageUrl,
            quantity: unit.quantity
        }));
    }

    get hasResults(): boolean {
        return this._createdItems.size() > 0;
    }

    async send(actorId: string): Promise<void> {
        const messageTemplate = await renderTemplate(Properties.module.templates.craftingMessage, this);
        await ChatMessage.create({user: new GameProvider().globalGameObject().user, speaker: {actor: actorId}, content: messageTemplate});
    }

}

export {CraftingChatMessage, IconType, CraftingChatMessageConfig}