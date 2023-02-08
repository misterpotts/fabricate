interface FabricateApplicationAction {

    id: string;

    perform(data: Map<string, string>): Promise<void>;

}

export { FabricateApplicationAction }