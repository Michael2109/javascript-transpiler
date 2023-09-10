namespace Ir {

    export class CompilationUnit {
        constructor(public models: Array<Statement>) {
        }
    }

    export class Statement {}
   export class ClassModel extends Statement{
        constructor(public name: string, public statements: Array<Statement>) {
            super()
        }
    }

    export class Method extends Statement{
        constructor(public name: string, public statements: Array<Statement>) {
            super()
        }
    }


}

export {Ir}