import { compileAndExecute} from "../utils/compiler-utils";

beforeAll(() => {
    global.console = require('console')
})

test('Compile arithmetic', () => {
   const results = compileAndExecute("test/integration/resources/integration/arithmetic", "arithmetic.js")

    expect(results[0]).toStrictEqual("1")
    expect(results[1]).toStrictEqual("3")
    expect(results[2]).toStrictEqual("-1")
    expect(results[3]).toStrictEqual("2")
    expect(results[4]).toStrictEqual("50")
    expect(results[5]).toStrictEqual("6")
});