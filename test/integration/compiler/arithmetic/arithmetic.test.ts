import {assertSuccess} from "../../../unit/lumina/parser/parser-test-utils";
import {parse} from "../../../../src/lumina/parser/parser";
import {compilationUnit} from "../../../../src/lumina/compiler/parser/statement-parser";
import { compileAndExecute} from "../utils/compiler-utils";

beforeAll(() => {
    global.console = require('console')
})

test('Compile arithmetic', () => {
    console.log(compileAndExecute("test/integration/resources/integration/arithmetic", "arithmetic.js"))
});