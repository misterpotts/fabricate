import type { FabricationOutcome } from '../core/FabricationOutcome';
import type { FabricationAction } from '../core/FabricationAction';
import type { CraftingError } from '../error/CraftingError';
import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { OutcomeType } from '../core/OutcomeType';

class CraftingChatMessage {
  private static readonly _unexpectedErrorIconUrl = 'modules/fabricate/assets/caution.svg';
  private static readonly _craftingFailureIconUrl = 'modules/fabricate/assets/fabricate-error.png';
  private static readonly _fabricateFireIconUrl = 'modules/fabricate/assets/fabricate-fire.png';
  private static readonly _fabricateEarthIconUrl = 'modules/fabricate/assets/fabricate-earth.png';
  private static readonly _fabricateWaterIconUrl = 'modules/fabricate/assets/fabricate-water.png';
  private static readonly _fabricateAirIconUrl = 'modules/fabricate/assets/fabricate-air.png';
  private static readonly _defaultImages: string[] = [
    CraftingChatMessage._fabricateFireIconUrl,
    CraftingChatMessage._fabricateEarthIconUrl,
    CraftingChatMessage._fabricateWaterIconUrl,
    CraftingChatMessage._fabricateAirIconUrl,
  ];

  private readonly _cardTitle: string;
  private readonly _cardContent: string;
  private readonly _cardFooterParts: string[];
  private readonly _addedItems: FabricationAction<ItemData>[];
  private readonly _cardImageUrl: string;
  private readonly _cardImageTitle: string;

  constructor(
    cardTitle: string,
    cardContent: string,
    cardFooterParts: string[],
    addedItems?: FabricationAction<ItemData>[],
    cardImageUrl?: string,
    cardImageTitle?: string,
  ) {
    this._cardTitle = cardTitle;
    this._cardContent = cardContent;
    this._addedItems = <FabricationAction<ItemData>[]>addedItems;
    this._cardFooterParts = cardFooterParts;
    this._cardImageUrl = <string>cardImageUrl;
    this._cardImageTitle = <string>cardImageTitle;
  }

  public static fromFabricationError(error: CraftingError) {
    return new CraftingChatMessage(
      'Crafting error',
      error.message,
      [],
      [],
      CraftingChatMessage._craftingFailureIconUrl,
      'Crafting ',
    );
  }

  static fromUnexpectedError(error: Error) {
    return new CraftingChatMessage(
      'Something went wrong',
      error.message,
      [],
      [],
      CraftingChatMessage._unexpectedErrorIconUrl,
      'Oops!',
    );
  }

  public static fromFabricationOutcome(outcome: FabricationOutcome): CraftingChatMessage {
    const footerParts: string[] =
      outcome.removedComponents && outcome.removedComponents.length > 0
        ? ['Removed:'].concat(outcome.removedComponents)
        : ['No components were removed'];
    const cardImageUrl =
      //outcome.type === OutcomeType.SUCCESS
      outcome.outcome === OutcomeType.SUCCESS
        ? CraftingChatMessage.randomCardImageUrl
        : CraftingChatMessage._craftingFailureIconUrl;
    return new CraftingChatMessage(
      outcome.outcome, //outcome.title,
      outcome.message, //outcome.failureDetails,
      footerParts,
      outcome.actions, //outcome.addedItems,
      cardImageUrl,
    );
  }

  get cardImageUrl() {
    return this._cardImageUrl;
  }

  static get randomCardImageUrl() {
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
    return this._cardTitle;
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

export { CraftingChatMessage };
