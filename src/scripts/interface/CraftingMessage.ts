interface CraftingMessage {
    send(actorId: string): Promise<void>;
}

export {CraftingMessage}