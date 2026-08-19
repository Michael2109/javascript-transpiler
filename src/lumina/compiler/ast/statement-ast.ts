import {ExpressionAst} from "./expression-ast";

namespace StatementAst {

    import Expression = ExpressionAst.Expression;


    export class Statement {
    }

    export class Block extends Statement{
        constructor(public statements: Array<Statement>) {
            super()
        }
    }

    export class Return extends Statement {
    }


    export class ExprAsStmt extends Statement {
        constructor(public expression: Expression) {
            super()
        }
    }

}

export {StatementAst}