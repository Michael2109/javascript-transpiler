import {compilationUnit} from "../../../src/lumina/parser/statement-parser";
import {DeclarationsAst} from "../../../src/lumina/compiler/ast/declarations-ast";
import CompilationUnit = DeclarationsAst.CompilationUnit;

test('Test parse and compile  to JavaScript', () => {

    const input = `
    class Test {
   
        let methodName(){
        
        }
    
    }`

    const parseResult = compilationUnit().createParser(input);

    const value: CompilationUnit = parseResult.value
});
