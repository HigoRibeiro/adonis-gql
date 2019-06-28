import {Directive} from "./index";

export class DirectiveManager {
    directives: Map<any, any>;

    constructor() {
        this.directives = new Map();
    }

    directive(name, directive) {
        const directiveInstance = new Directive(name, directive);
        this.directives.set(name, directiveInstance);
    }

    clear() {
        this.directives = new Map();
    }
}
