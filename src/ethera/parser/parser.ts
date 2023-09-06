import {variable} from "./lexical-parser";

const DIGIT_REGEX: RegExp = new RegExp(`^[0-9]+`);

type Parser<T> = (input: string) => ParseResult<T>

class P<T> {
    public readonly createParser: Parser<T>;

    constructor(parserFn:  Parser<T> ) {
            this.createParser = parserFn;
    }

    map<U>(transform: (value: T) => U): P<U> {

        const t = this;

        const p: Parser<U> = (input: string) => {
            const parseResult: ParseResult<T> = t.createParser(input);
            const transformedValue: U = parseResult.success ? transform(parseResult.value) : undefined;

            return {
                success: parseResult.success,
                value: transformedValue,
                remaining: parseResult.remaining
            };
        }

        return new P<U>(p)
    }

    filter(applyFilter: (value: T) => boolean): P<T> {

        const t = this;

        return new P<T>( (input: string) => {
            const parseResult: ParseResult<T> = t.createParser(input);
            const success: boolean = applyFilter(parseResult.value);
            return {success: success, value: parseResult.value, remaining: parseResult.remaining};
        })
    }
}

interface ParseResult<T> {
    success: boolean;
    value: T;
    stringValue?: string;
    remaining: string;
    disallowBacktrack?: boolean
}

type FlattenArray<T> = T extends (infer U)[]
    ? U extends any[]
        ? FlattenArray<U>
        : U
    : T;


type ElementTypeIfLengthOne<T extends any[]> = T['length'] extends 1 ? T[0] : T;

type FilterOutVoid<T extends any[]> = T extends [infer Head, ...infer Rest]
    ? Head extends void
        ? FilterOutVoid<Rest>
        : [Head, ...FilterOutVoid<Rest>]
    : T;

function removeVoidFromTuple<T extends any[]>(tuple: T): FilterOutVoid<T> {
    return tuple.filter((item) => item !== undefined) as FilterOutVoid<T>;
}

function seq<T extends any[]>(...parsers: { [K in keyof T]: P<ElementTypeIfLengthOne<FilterOutVoid<T[K]>>> }): P<ElementTypeIfLengthOne<FilterOutVoid<T>>> {

    return new P((input: string) => {

        let remainingInput = input;

        let results: any[] = []

        for (const parser of parsers) {
            let parseResult: ParseResult<any> = parser.createParser(remainingInput);
            remainingInput = parseResult.remaining;

            if (parseResult.success) {
                results.push(parseResult.value);
            } else {
                return {success: false, value: undefined, remaining: remainingInput}
            }
        }

        const filteredResults = removeVoidFromTuple(results as T)

        return {
            success: true,
            value: filteredResults.length > 1 ? filteredResults : filteredResults[0],
            remaining: remainingInput
        };
    })
}

function lazy<T>(fn: () => P<T>): P<T> {
    return new P<T>( (input: string) => {
        return fn().createParser(input)
    })
}

function charIn(charPattern: string): P<string> {
    return new P<string>((input: string) => {

        const match = input.match(`^[${charPattern}]`);

        if (match) {
            return {success: true, value: match[0], remaining: input.slice(match[0].length)};
        }

        return {success: false, value: undefined, remaining: input};
    })
}


function charsWhileIn(chars: string): P<string> {
    return new P<string>((input: string) => {

        let remainingInput = input;

        let result = ""
        while (true) {
            const parseResult = charIn(chars).createParser(remainingInput)
            remainingInput = parseResult.remaining;

            if (parseResult.success) {
                result += parseResult.value
            } else {
                return {success: true, value: result, remaining: remainingInput}

            }
        }
    })
}

function spaces(): P<void> {
    return new P<void>( (input: string) => {

        return charsWhileIn(" \r\n").map(() => {
        }).createParser(input)
    })
}

function capture(parser: P<void>): P<string> {
    return new P<string>( (input: string) => {
        const parseResult = parser.createParser(input)

        if (parseResult.success) {
            return {success: true, value: parseResult.stringValue, remaining: parseResult.remaining}
        } else {
            return {success: false, value: undefined, remaining: input}
        }
    })
}

function str(expected: string): P<void> {

    return new P<void>( (input: string) => {

        if (input.startsWith(expected)) {
            return {
                success: true,
                value: undefined,
                stringValue: expected,
                remaining: input.slice(expected.length)
            };
        }
        return {success: false, value: undefined, remaining: input};
    })
}

function regex(expected: RegExp): P<string> {

    return new P<string>( (input: string) => {

        const match = input.match(expected);

        if (match) {
            return {success: true, value: match[0], remaining: input.slice(match[0].length)};
        }

        return {success: false, value: undefined, remaining: input};

    })
}

function digit(): P<string> {
    return regex(DIGIT_REGEX)
}

function end(): P<void> {
    return new P<void>( (input: string) => {
        if (input === "") {
            return {success: true, value: undefined, remaining: input};
        }
        return {success: false, value: undefined, remaining: input};
    });
}

function either<T, U>(parserA: P<T>, parserB: P<U>): P<T | U> {

    return new P<T | U>( (input: string) => {

        const result = parserA.createParser(input);
        if (result.success) {
            return result;
        } else if (!result.disallowBacktrack) {
            return parserB.createParser(input)
        } else {
            return {success: false, value: undefined, remaining: result.remaining}
        }

    })
}

function eitherMany<T>(...parsers: Array<P<T>>): P<T> {

    return new P<T>( (input: string) => {

        for (let parser of parsers) {
            const parseResult = parser.createParser(input)
            if (parseResult.success) {
                return parseResult
            }
        }

        return {success: false, value: undefined, remaining: input}

    })
}

function cut<T>(parser: P<T>): P<T> {
    return new P<T>( (input: string) => {
        const result = parser.createParser(input);
        if (result.success) {
            return result;
        } else {
            result.disallowBacktrack = true;
            return result
        }
    })
}

function rep<T>(parser: P<T>, options?: {
    min?: number,
    max?: number,
    sep?: P<unknown>
}): P<Array<T>> {

    return new P<Array<T>>( (input: string) => {

        const results: Array<T> = []
        let remainingInput = input;

        const sep = options?.sep

        while (true) {
            const parseResult = parser.createParser(remainingInput)
            if (parseResult.success) {
                results.push(parseResult.value)
                remainingInput = parseResult.remaining;

                if (sep !== undefined) {
                    // Parse separator - If fails, break
                    const sepParseResult = sep.createParser(remainingInput);
                    if (sepParseResult.success) {
                        remainingInput = sepParseResult.remaining
                    } else {
                        break;
                    }
                }
            } else {
                break;
            }
        }

        return {success: true, value: results, remaining: remainingInput};
    })
}

function opt<T>(parser: P<T>): P<T | void> {
    return new P<T | void>( (input: string) => {


        const parseResult = parser.createParser(input);
        if (parseResult.success) {
            return parseResult;
        }
        return {success: true, value: undefined, remaining: parseResult.remaining}

    })
}

function index<T>(parser: Parser<T>): P<T> {
    return new P<T>( (input: string) => {
        const result = parser(input);
        if (result.success) {
            return result;
        } else {
            result.disallowBacktrack = true;
            return result
        }
    })
}

export {
    Parser,
    P,
    ParseResult,
    lazy,
    capture,
    either,
    eitherMany,
    cut,
    seq,
    digit,
    str,
    end,
    rep,
    regex,
    opt,
    charIn,
    charsWhileIn,
    spaces
}