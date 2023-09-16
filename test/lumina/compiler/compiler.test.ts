import {compilationUnit} from "../../../src/lumina/compiler/parser/statement-parser";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";
import CompilationUnit = DeclarationAst.CompilationUnit;

test('Test parse and compile  to JavaScript', () => {

    const input = `
    class Test {
   
        let methodName(){
        
        }
    
    }`

    const parseResult = compilationUnit().createParser(input);

    const value: CompilationUnit = parseResult.value
});
