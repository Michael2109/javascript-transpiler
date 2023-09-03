"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["VARIABLE"] = 1] = "VARIABLE";
    TokenType[TokenType["OPERATOR"] = 2] = "OPERATOR";
    TokenType[TokenType["PARENTHESIS"] = 3] = "PARENTHESIS";
    TokenType[TokenType["SPACES"] = 4] = "SPACES";
})(TokenType || (exports.TokenType = TokenType = {}));
//# sourceMappingURL=token-type.js.map