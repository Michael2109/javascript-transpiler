import {assertFail, assertSuccess} from "../parser/parser-test-utils";
import {modifier} from "../../../src/ethera/parser/expression-parser";
import {compilationUnit} from "../../../src/ethera/parser/statement-parser";
import {AstToIr} from "../../../src/ethera/compiler/ast/ast-to-ir";
import {CodeGenerator} from "../../../src/ethera/compiler/codegen/code-generator";
import {Ast} from "../../../src/ethera/compiler/ast/ast";
import CompilationUnit = Ast.CompilationUnit;

test('Test parse and compile  to JavaScript', () => {

    const input = `
    class Test {
   
        let methodname(){
        
        }
    
    }
   
    `

    const parseResult = compilationUnit().createParser(input);

    console.log(JSON.stringify(parseResult))

    const value: CompilationUnit = parseResult.value

    console.log(JSON.stringify(AstToIr.compilationUnitToIr(value)))

    console.log(CodeGenerator.compilationUnitToCode(AstToIr.compilationUnitToIr(value)))
});
