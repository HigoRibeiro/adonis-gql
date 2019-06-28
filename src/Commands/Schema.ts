import {MakeBase} from "./MakeBase";
import {boxen} from "boxen";

export class Schema extends MakeBase {
    error: any;

    static get signature() {
        return `
      gql:schema
      { name: Name of schema }
      { -r, --resolver: Generate resolvers query and mutation for the schema }
      { -q, --query: Generate only query resolver for the schema }
      { -m, --mutation: Generate only mutation resolver for the schema }
    `;
    }

    static get description() {
        return 'Make a new schema to graphql';
    }

    async handle({name}, {query, mutation, resolver}) {
        try {
            const info = await this.generateBlueprint('schemas', name);

            if (resolver) {
                await this.generateBlueprint('gqlControllers', name, {
                    query: true
                });
                await this.generateBlueprint('gqlControllers', name, {
                    mutation: true
                });
            } else if (query) {
                await this.generateBlueprint('gqlControllers', name, {
                    query
                });
            } else if (mutation) {
                await this.generateBlueprint('gqlControllers', name, {
                    mutation
                });
            }

            this.printInstructions(info);
        } catch (e) {
            this.error(e.message);
        }
    }

    printInstructions(info) {
        const lines = [
            'Register schema as follows',
            '',
            `1. Open ${this.chalk.cyan('start/graphql.js')}`,
            `2. Add ${this.chalk.cyan(info.name)} schema`
        ];

        console.log(
            boxen(lines.join('\n'), {
                dimBorder: true,
                align: 'left',
                padding: {
                    left: 8,
                    right: 8
                },
                borderColor: 'yellow'
            })
        )
    }
}
