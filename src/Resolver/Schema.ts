import {readFileSync} from "fs";

export class Schema {
    name: any;
    _resolvers: any;

    constructor(name, resolvers) {
        this.name = name;
        this._resolvers = resolvers;
    }

    _getSchemaFile() {
        global.iocResolver._directories.schemas = 'Schemas';
        const namespace = global.iocResolver.forDir('schemas').translate(this.name);
        return readFileSync(`${namespace}.graphql`, 'utf-8')
    }

    transform() {
        return this._getSchemaFile();
    }

    middleware(middlewareList) {
        this._resolvers.forEach(resolver => {
            resolver.registerMiddleware(middlewareList)
        });
        return this
    }
}
