"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parser {
    parse(tokens) {
        this.tokens = Object.assign({}, tokens);
        this.lookahead = this.tokens[0];
    }
    nextToken() {
        this.tokens.pop();
        if (this.tokens.length === 0) {
            this.lookahead = undefined;
        }
        else {
            this.lookahead = this.tokens[0];
        }
    }
}
//# sourceMappingURL=parser.js.map