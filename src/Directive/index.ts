export class Directive {
    name: any;
    Directive: any;

    constructor(name, Directive) {
        this.name = name;
        this.Directive = Directive;
    }

    _getDirectiveFile() {
        global.iocResolver._directories.directives = 'Directives';
        const namespace = global.iocResolver
            .forDir('directives')
            .translate(this.Directive);
        return global.use(namespace);
    }

    transform() {
        return this._getDirectiveFile();
    }
}
