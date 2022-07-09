import Properties from "../Properties";
import {CraftingChatMessage} from "./CraftingChatMessage";

interface ChatDialog {

    send(actorId: string, chatMessage: CraftingChatMessage): Promise<ChatMessage>;

}

class DefaultChatDialog implements ChatDialog {

    async send(actorId: string, craftingChatMessage: CraftingChatMessage): Promise<ChatMessage> {
        const messageTemplate = await renderTemplate(Properties.module.templates.craftingMessage, craftingChatMessage);
        return ChatMessage.create({user: game.user, speaker: {actor: actorId}, content: messageTemplate});
    }

}

export { ChatDialog, DefaultChatDialog }