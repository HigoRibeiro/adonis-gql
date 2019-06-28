import {MakeBase} from "./MakeBase";

export class Directive extends MakeBase {
    error: any;

    static get signature() {
        return `
    gql:directive
    { name: Name of directive }
    `;
    }

    static get description() {
        return 'Make a new directive to graphql';
    }

    async handle({name}) {
        try {
            await this.generateBlueprint('directives', name);
        } catch (e) {
            this.error(e.message);
        }
    }
}
