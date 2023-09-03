"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const token_1 = require("./token");
const token_type_1 = require("./token-type");
class Tokenizer {
    static tokenize(input) {
        const tokens = [];
        while (input.length > 0) {
            let matched = false;
            for (const tokenInfo of this.tokenInfos) {
                const regex = new RegExp(`^${tokenInfo.pattern.source}`);
                const match = input.match(regex);
                if (match) {
                    tokens.push(new token_1.Token(tokenInfo.tokenType, match[0]));
                    input = input.slice(match[0].length);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                throw new Error(`Unable to tokenize: "${input}"`);
            }
        }
        return tokens;
    }
}
exports.Tokenizer = Tokenizer;
Tokenizer.tokenInfos = [
    { tokenType: token_type_1.TokenType.NUMBER, pattern: /\d+/ },
    { tokenType: token_type_1.TokenType.VARIABLE, pattern: /[a-zA-Z_]\w*/ },
    { tokenType: token_type_1.TokenType.OPERATOR, pattern: /[+\-*/]/ },
    { tokenType: token_type_1.TokenType.PARENTHESIS, pattern: /[()]/ },
    { tokenType: token_type_1.TokenType.SPACES, pattern: /[ \r\n]/ },
];
//# sourceMappingURL=tokenizer.js.map