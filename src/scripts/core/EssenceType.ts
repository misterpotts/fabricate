enum EssenceType {
    EARTH = 'EARTH',
    AIR = 'AIR',
    WATER = 'WATER',
    FIRE = 'FIRE',
    POSITIVE_ENERGY = 'POSITIVE_ENERGY',
    NEGATIVE_ENERGY = 'NEGATIVE_ENERGY'
}

class EssenceTypeIconConverter {

    private static readonly _registeredIcons: Map<EssenceType, string> = new Map([
        [EssenceType.NEGATIVE_ENERGY, '<i class="fas fa-moon" title="Negative Energy"></i>'],
        [EssenceType.POSITIVE_ENERGY, '<i class="fas fa-sun" title="Positive Energy"></i>'],
        [EssenceType.AIR, '<i class="fas fa-wind" title="Air"></i>'],
        [EssenceType.EARTH, '<i class="fas fa-mountain" title="Earth"></i>'],
        [EssenceType.WATER, '<i class="fas fa-tint" title="Water"></i>'],
        [EssenceType.FIRE, '<i class="fas fa-fire" title="Fire"></i>']
    ]);

    public static convertToIconMarkup(essenceType: EssenceType): string {

        const iconMarkup = this._registeredIcons.get(essenceType);
        if (iconMarkup && iconMarkup.length > 0) {
            return iconMarkup;
        }
        return essenceType;

    }

    public static convertSeriesToIconMarkup(essenceTypes: EssenceType[]): string {
        const essenceFrequencies: Map<EssenceType, number> = new Map();
        essenceTypes.forEach((essence: EssenceType) => {
            if (essenceFrequencies.has(essence)) {
                const currentCount: number = essenceFrequencies.get(essence);
                essenceFrequencies.set(essence, currentCount + 1);
            } else {
                essenceFrequencies.set(essence, 1);
            }
        });
        const parts: string[] = [];
        essenceFrequencies.forEach((amount: number, essenceType: EssenceType) => {
            parts.push(`${this.convertToIconMarkup(essenceType)} x${amount}`);
        });
        return parts.join(', ');
    }

}

export {EssenceType, EssenceTypeIconConverter}