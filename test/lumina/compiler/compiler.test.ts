import {compilationUnit} from "../../../src/lumina/parser/statement-parser";
import {StatementAst} from "../../../src/lumina/compiler/ast/statement-ast";
import CompilationUnit = StatementAst.CompilationUnit;

test('Test parse and compile  to JavaScript', () => {

    const input = `
    class Test {
   
        let methodName(){
        
        }
    
    }`

    const parseResult = compilationUnit().createParser(input);

    const value: CompilationUnit = parseResult.value
});
