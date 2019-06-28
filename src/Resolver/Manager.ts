import {Store} from "./Store";

export class ResolverManager {
    mutation(name, Controller) {
        return Store.resolver(name, Controller, 'Mutation');
    }

    query(...args) {
        return Store.resolver(...args);
    }

    schema(name, callback) {
        const schema = Store.schema(name, callback);
        Store.restore();
        return schema
    }

    get resolvers() {
        return Store.resolvers;
    }

    get schemas() {
        return Store.schemas;
    }

    clear() {
        Store.resolversClear();
        Store.schemasClear();
    }
}
