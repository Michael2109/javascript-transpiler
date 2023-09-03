"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.str = void 0;
function succeed(value) {
    return input => ({ success: true, value, rest: input });
}
function fail() {
    return input => ({ success: false });
}
function str(expected) {
    return input => {
        if (input.startsWith(expected)) {
            return { success: true, value: expected, rest: input.slice(expected.length) };
        }
        return { success: false };
    };
}
exports.str = str;
/*

function choice<T>(parsers: Parser<T>[]): Parser<T> {
    return input => {
        for (const parser of parsers) {
            const result = parser(input);
            if (result.success) {
                return result;
            }
        }
        return { success: false };
    };
}

function sequence<T, U>(parser1: Parser<T>, parser2: Parser<U>): Parser<[T, U]> {
    return input => {
        const result1 = parser1(input);
        if (!result1.success) {
            return { success: false };
        }
        const result2 = parser2(result1.rest || "");
        if (!result2.success) {
            return { success: false };
        }
        return { success: true, value: [result1.value!, result2.value!], rest: result2.rest };
    };
}

function many<T>(parser: Parser<T>): Parser<T[]> {
    return input => {
        let results: T[] = [];
        let rest = input;

        while (true) {
            const result = parser(rest);
            if (result.success) {
                results.push(result.value!);
                rest = result.rest || "";
            } else {
                break;
            }
        }

        return { success: true, value: results, rest };
    };
}

function andThen<T, U>(parser: Parser<T>, nextParser: Parser<U>): Parser<U> {
    return input => {
        const result1 = parser(input);
        if (result1.success) {
            return nextParser(result1.rest || "");
        }
        return { success: false };
    };
}

// Example usage
const digitParser: Parser<number> = input => {
    const digit = parseInt(input[0]);
    if (!isNaN(digit)) {
        return { success: true, value: digit, rest: input.slice(1) };
    }
    return { success: false };
};

const numberParser: Parser<number> = many(char(" ").andThen(succeed("")).andThen(digitParser)).andThen(digitParser);

const expressionParser: Parser<number> = sequence(numberParser, char("+").andThen(numberParser)).map(([left, right]) => left + right);


const result = expressionParser("2 + 3");
if (result.success) {
    console.log("Parsing successful. Result:", result.value);
} else {
    console.log("Parsing failed.");
}
*/ 
//# sourceMappingURL=p.js.map