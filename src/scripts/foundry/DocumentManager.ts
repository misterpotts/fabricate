interface DocumentManager {

    getDocumentByUuid(id: string): Promise<any>;

    getDocumentsByUuid(ids: string[]): Promise<any[]>;

}

class DefaultDocumentManager implements DocumentManager {

    public async getDocumentByUuid(id: string): Promise<any> {
        return fromUuid(id);
    }

    public async getDocumentsByUuid(ids: string[]): Promise<any[]> {
        return Promise.all(ids.map(id => fromUuid(id)));
    }

}

export { DocumentManager, DefaultDocumentManager }