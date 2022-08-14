import {FabricateItem} from "../../common/FabricateItem";

interface AlchemyResult<D> {
    customItemData: D;
    baseItem: FabricateItem;
}

export {AlchemyResult}