import {StatementIr} from "./statement-ir";

namespace DeclarationIr {
    export class Namespace extends StatementIr.Statement {
        constructor(public name: string, public statements: Array<StatementIr.Statement>) {
            super();
        }
    }
}
export {DeclarationIr}