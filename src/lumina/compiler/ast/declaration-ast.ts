import {ExpressionAst} from "./expression-ast";
import {StatementAst} from "./statement-ast";

namespace DeclarationAst {

    import NameSpace = ExpressionAst.NameSpace;
    import Expression = ExpressionAst.Expression;
    import Type = ExpressionAst.Type;
    import Annotation = ExpressionAst.Annotation;
    import Modifier = ExpressionAst.Modifier;
    import Statement = StatementAst.Statement;


    export class Declaration extends StatementAst.Statement {
    }

    export class CompilationUnit {
        constructor(public nameSpace: NameSpace,
                    public imports: Import[],
                    public statements: Statement[]) {
        }
    }

    export class Import {
        constructor(public loc: string[]) {
        }
    }

    export class Namespace {
        constructor(public name: string, public statements: Array<Statement>) {
        }
    }

    export class Model extends Declaration {
    }


    export class ClassModel extends Model {
        constructor(
            public name: string,
            public modifiers: Modifier[],
            public fields: Field[],
            public parent: Type | undefined,
            public parentArguments: Expression[],
            public interfaces: Type[],
            public statements: Statement[]
        ) {
            super()
        }

    }

    export class Method implements Declaration {
        constructor(public name: string,
                    public annotations: Annotation[],
                    public fields: Field[],
                    public modifiers: Modifier[],
                    public returnType: Type | undefined,
                    public statements: Array<Statement>) {
        }

    }

    export class Lambda {
        constructor(public fields: Array<Field>, public statements: Array<Statement>) {
        }
    }

    export class Field {
        constructor(public name: string, public required: boolean, public ref: Type, public init?: Expression) {
        }
    }

    export class Assign implements Declaration {
        constructor(public name: string,
                    public type: Type | undefined,
                    public immutable: boolean,
                    public statement: Statement) {
        }

    }

    export class Reassign implements Statement {
        constructor(public name: string,
                    public statement: Statement) {
        }
    }

}

export {DeclarationAst}