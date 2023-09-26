import {StatementIr} from "./statement-ir";
import {ExpressionIr} from "./expression-ir";

namespace DeclarationIr {
    export class Namespace extends StatementIr.Statement {
        constructor(public name: string, public statements: Array<StatementIr.Statement>) {
            super();
        }
    }

    export class Field {
        constructor(public name: string, public required: boolean, public ref: StatementIr.Type, public init?: ExpressionIr.Expression) {
        }
    }

}
export {DeclarationIr}