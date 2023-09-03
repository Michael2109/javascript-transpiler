class Tokenizer {
    static tokenize(input) {
        const tokens = [];
        while (input.length > 0) {
            let matched = false;
            for (const tokenInfo of this.tokenInfos) {
                const regex = new RegExp(`^${tokenInfo.pattern.source}`);
                const match = input.match(regex);
                if (match) {
                    tokens.push(new Token(tokenInfo.tokenType, match[0]));
                    input = input.slice(match[0].length);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                throw new Error(`Unable to tokenize: ${input}`);
            }
        }
        return tokens;
    }
}
Tokenizer.tokenInfos = [
    { tokenType: TokenType.NUMBER, pattern: /\d+/ },
    { tokenType: TokenType.VARIABLE, pattern: /[a-zA-Z_]\w*/ },
    { tokenType: TokenType.OPERATOR, pattern: /[+\-*/]/ },
    { tokenType: TokenType.PARENTHESIS, pattern: /[()]/ },
];
//# sourceMappingURL=tokenizer.js.map