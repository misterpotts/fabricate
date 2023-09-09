import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";

const openItemSheet = function openItemSheet(node: any, itemUuid: string) {
    node.onclick = async () => {
        const document = await new DefaultDocumentManager().loadItemDataByDocumentUuid(itemUuid);
        await document.sourceDocument.sheet.render(true);
    };
    return {
        destroy() {
            node.onClick = null;
        }
    }
}

export default openItemSheet;