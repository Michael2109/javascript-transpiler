"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const p_1 = require("./compiler/parser/p");
const inputExpression = 'input';
const parsed = (0, p_1.str)(inputExpression)("input");
if (parsed.success) {
    console.log("Parsing successful. Result:", parsed.value);
}
else {
    console.log("Parsing failed.");
}
//const tokens = Tokeniser.tokenize(inputExpression);
//console.log(tokens);
//# sourceMappingURL=app.js.map