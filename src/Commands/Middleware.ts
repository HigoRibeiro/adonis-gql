import {MakeBase} from "./MakeBase";

export class Middleware extends MakeBase {
    error: any;

    static get signature() {
        return `
    gql:middleware
    { name: Name of middleware }
    `
    }

    static get description() {
        return 'Make a new middleware to graphql'
    }

    async handle({name}) {
        try {
            await this.generateBlueprint('middlewares', name)
        } catch (e) {
            this.error(e.message)
        }
    }
}
