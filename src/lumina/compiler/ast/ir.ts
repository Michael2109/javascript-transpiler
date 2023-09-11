namespace Ir {

    export class CompilationUnit {
        constructor(public statements: Array<Statement>) {
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

    export class ModuleMethod extends Statement{
        constructor(public name: string, public statements: Array<Statement>) {
            super()
        }
    }


}

export {Ir}