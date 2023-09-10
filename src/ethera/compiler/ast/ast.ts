namespace Ast {
    export class CompilationUnit {
        constructor(   public nameSpace: NameSpace,
        public imports: Import[],
        public models: Model[]) {
        }

    }

    export interface Import {
        loc: string[];
    }

    export class Field {
        constructor(name: string, ref: Ref, init?: Expression) {
        }
    }

    export interface Type {
        ref: Ref;
    }

    export type Ref = RefSpecial | RefLocal | RefQual;

    export class RefSpecial {
        constructor(public specialRef: SpecialRef) {

        }
    }

    export class RefLocal {
        constructor(public name: string) {
        }
    }

    export interface RefQual {
        qualName: QualName;
    }

    export type SpecialRef = Super | This;

    export class Super {
    }

    export class This {
    }

    export type TypeRel = Inherits | Extends | Equals;

    export class Inherits {
    }

    export class Extends {
    }

    export class Equals {
    }

    export interface NameSpace {
        nameSpace: string[];
    }

    export interface Name {
        value: string;
    }

    export interface QualName {
        nameSpace: NameSpace;
        name: string;
    }

    export interface Annotation {
        name: Name;
    }

    export type Modifier = Public | Protected | Private | PackageLocal | Abstract | Open | Pure;

    export class Public {
    }

    export class Protected {
    }

    export class Private {
    }

    export class PackageLocal {
    }

    export class Abstract {
    }

    export class Open {
    }

    export class Pure {
    }

    export interface Block extends Statement {
    }

    export class Inline implements Block {
        expression: Expression
    }

    export class CurlyBraceBlock implements Block {

        constructor(public statements: Statement[]) {
        }

    }

    export interface Expression {
    }

    export class BlockExpr implements Expression {
        expressions: Expression[]
    }

    export class NestedExpr implements Expression {

        expressions: Expression[]
    }

    export interface Identifier extends Expression {
        name: Name;
    }

    export class MethodCall implements Expression {
        name: string
        expressions: Expression[]
    }

    export class NewClassInstance implements Expression {
        constructor(public type: Type, public expression: Expression[], public anonymousClass: Statement | null) {
        }
    }

    export class StringLiteral implements Expression {
        constructor(public value: string) {
        }
    }

    export class Ternary implements Expression {
        constructor(public condition: Expression, public ifExpr: Expression, public elseExpr: Expression) {
        }
    }

    export class Tuple implements Expression {
    }

    export class BoolConst implements Expression {
        constructor(public value: boolean) {
        }
    }

    export class Not implements Expression {
    }

    export class ABinary implements Expression {
        constructor(public op: ABinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export class BBinary implements Expression {
        constructor(public op: BBinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export class RBinary implements Expression {
        constructor(public op: RBinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export class IntConst implements Expression {
        constructor(public value: bigint) {
        }
    }

    export class IntObject implements Expression {
        constructor(public value: Statement) {
        }
    }

    export class LongConst implements Expression {
        constructor(public value: bigint) {
        }
    }

    export class DoubleConst implements Expression {
        constructor(public value: number) {
        }
    }

    export class FloatConst implements Expression {
        constructor(public value: number) {
        }
    }

    export class Variable implements Expression {
        constructor(public name: string) {
        }
    }

    export class Negate implements Expression {
        constructor(public expression: Expression) {
        }
    }

    export class ArrayValue implements Expression {
    }

    export class SpecialRefAsExpr implements Expression {
    }

    export interface Model extends Statement {
    }

    export interface Statement {
    }

    export class ClassModel implements Model {
        constructor(
          public  name: string,
        public modifiers: Modifier[],
        public fields: Field[],
        public parent: Type | undefined,
        public  parentArguments: Expression[],
        public  interfaces: Type[],
        public  statements: Statement[]
        ) {
        }

    }

    export class ObjectModel implements Model {
        name: Name;
        modifiers: Modifier[];
        fields: Field[];
        parent: Type | null;
        parentArguments: Expression[];
        interfaces: Type[];
        body: Statement[];
    }

    export class TraitModel implements Model {
        name: Name;
        modifiers: Modifier[];
        fields: Field[];
        parent: Type | null;
        parentArguments: Expression[];
        interfaces: Type[];
        body: Statement[];
    }

    export class Method implements Statement {
        constructor(public  name: string,
                    public annotations: Annotation[],
                    public fields: Field[],
                    public modifiers: Modifier[],
                    public  returnType: Ref | undefined,
                    public   statements: Array<Statement>) {
        }

    }

    export class For implements Statement {
    }

    export class While implements Statement {
    }

    export class If implements Statement {
        constructor(public condition: Expression, public ifBlock: Statement, public elseBlock?: Statement) {
        }
    }

    export class Assign implements Statement {
        name: string;
        type: Type | null;
        immutable: boolean;
        block: Block;
    }

    export class AssignMultiple implements Statement {
        name: Name[];
        type: Type | null;
        immutable: boolean;
        block: Block;
    }

    export class Reassign implements Statement {
        name: Name;
        block: Block;
    }

    export class Return implements Statement {
    }

    export class Lambda implements Statement {
    }

    export class ExprAsStmt implements Statement {
        constructor(public expression: Expression) {
        }
    }

    export class BlockStmt implements Statement {
        constructor(public statements: Statement[]) {
        }
    }

    export class Match implements Statement {
    }

    export class Case {
        constructor(public expression: Expression, public block: Block) {
        }
    }

    export interface Operator {
    }

    export interface ABinOp extends Operator {
    }

    export interface ABinOp {
        Add,
        Subtract,
        Multiply,
        Divide,
    }

    export interface BBinOp extends Operator {
    }

    export interface BBinOp {
        And,
        Or,
    }

    export interface RBinOp extends Operator {
    }

    export interface RBinOp {
        GreaterEqual,
        Greater,
        LessEqual,
        Less,
        Equal,
    }
}

export {Ast}