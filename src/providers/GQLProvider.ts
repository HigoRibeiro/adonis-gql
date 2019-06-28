import {ServiceProvider} from '@adonisjs/fold'
import {SchemaDirectiveVisitor} from 'graphql-tools'

import {GqlServer} from '../Server'
import {Resolvers} from "../Commands/Resolvers";
import {Schema} from "../Commands/Schema";
import {Directive} from "../Commands/Directive";
import {Middleware} from "../Commands/Middleware";


class GQLProvider extends ServiceProvider {
    _registerGQL() {
        this.app.singleton('Adonis/Addons/GqlServer', () => {
            return new GqlServer()
        });

        this.app.alias('Adonis/Addons/GqlServer', 'Gql');
        this.app.bind('SchemaDirectiveVisitor', () => SchemaDirectiveVisitor)
    }

    _registerCommands() {
        this.app.bind('Adonis/Commands/GqlSchema', () => {
            return Schema;
        });

        this.app.bind('Adonis/Commands/GqlController', () => {
            return Resolvers;
        });

        this.app.bind('Adonis/Commands/GqlDirective', () => {
            return Directive;
        })

        this.app.bind('Adonis/Commands/GqlMiddleware', () => {
            return Middleware;
        })
    }

    register() {
        this._registerCommands();
    }

    boot() {
        this._registerGQL();

        const ace = require('@adonisjs/ace');
        ace.addCommand('Adonis/Commands/GqlSchema');
        ace.addCommand('Adonis/Commands/GqlController');
        ace.addCommand('Adonis/Commands/GqlDirective');
        ace.addCommand('Adonis/Commands/GqlMiddleware');
    }
}
