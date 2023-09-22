import {Optional} from "./optional";
import {InputStream} from "./input-stream";

const DIGIT_REGEX: RegExp = new RegExp(`^[0-9]+`);

type Parser<T> = (inputStream: InputStream) => ParseResult<T>

export function parse <T> (input: string, p: P<T>): ParseResult<T>{
    return  p.createParser(new InputStream(input))
}

class P<T> {
    public readonly createParser: Parser<T>;

    constructor(parserFn: Parser<T>) {
        this.createParser = parserFn;
    }

    map<U>(transform: (value: T) => U): P<U> {

        const t = this;

        const p: Parser<U> = (inputStream: InputStream) => {
            const parseResult: ParseResult<T> = t.createParser(inputStream);

            if(parseResult.success) {
                const parseSuccess = parseResult as ParseSuccess<T>
                const transformedValue: U = transform(parseSuccess.value);

                return {
                    success: true,
                    value: transformedValue,
                    position: parseResult.position
                };
            }
            return parseResult
        }

        return new P<U>(p)
    }

    filter(applyFilter: (value: T) => boolean): P<T> {

        const t = this;

        return new P<T>((inputStream: InputStream) => {
            const parseResult: ParseResult<T> = t.createParser(inputStream);

            if(parseResult.success){
                const parseSuccess = parseResult as ParseSuccess<T>
                const success: boolean = applyFilter(parseSuccess.value);
                if(success) {
                    return {success: true, value: parseSuccess.value, position: parseSuccess.position};
                }
                return {success: false, position: inputStream.position}
            }
            return  parseResult as ParseFailure<T>
        })
    }
}

export interface ParseSuccess<T> extends ParseResult<T> {
    success: true;
    value: T;
    stringValue?: string;
}

export interface ParseFailure<T> extends ParseResult<T>{
    label?: string
    success: false
    expected: Array<string>
}

interface ParseResult<T> {
    success: boolean;
    position: number;
    disallowBacktrack?: boolean;
}

function str(expected: string): P<void> {

    return new P<void>((inputStream: InputStream) => {

        for (let expectedChar of expected) {
            if (inputStream.peek() !== expectedChar) {

                const tempPosition = inputStream.position

                return {
                    success: false,
                    disallowBacktrack: false,
                    expected: [],
                    position: tempPosition
                }
            }
            inputStream.next()
        }
        return {
            success: true,
            value: undefined,
            stringValue: expected,
            position: inputStream.position
        };
    })
}

function capture(parser: P<void>): P<string> {
    // @ts-ignore
    return new P<string>((inputStream: InputStream) => {
        const parseResult = parser.createParser(inputStream)

        if (parseResult.success) {
            const parseSuccess = parseResult as ParseSuccess<void>
            return {success: true, value: parseSuccess.stringValue, position: parseSuccess.position}
        }
        return parseResult
    })
}

function cut<T>(parser: P<T>): P<T> {
    return new P<T>((inputStream: InputStream) => {
        const result = parser.createParser(inputStream);
        if (result.success) {
            const parseSuccess = result as ParseSuccess<T>
            parseSuccess.disallowBacktrack = true;
            return parseSuccess;
        } else {
            return result
        }
    })
}

function digit(): P<number> {
    return rep(capture(charIn("0-9")), {min: 1}).map(characters => +characters.join(""))
}

function charIn(expected: string): P<void> {
    return new P<void>((inputStream: InputStream) => {
        const char = inputStream.peek()

        if (char) {
            const match = char.match("[" + expected + "]");

            if (match) {
                inputStream.next()
                return {success: true, value: undefined, stringValue: char, position: inputStream.position};
            }
        }
        return {success: false, position: inputStream.position, disallowBacktrack: false, expected: []}
    });
}


function charsWhileIn(characters: string): P<void> {
    return new P<void>((inputStream: InputStream) => {


        let result = ""
        while (true) {
            const parseResult = charIn(characters).createParser(inputStream)

            if (parseResult.success) {
                const parseSuccess = parseResult as ParseSuccess<string>
                result += parseSuccess.stringValue
            } else {
                return {success: true, value: undefined, stringValue: result, position: inputStream.position}

            }
        }
    })
}


function spaces(): P<void> {
    return charsWhileIn(" \r\n\t")
}

function rep<T>(parser: P<T>, options: {
    min?: number,
    max?: number,
    sep?: P<any>
} = {min: 0}): P<Array<T>> {

    return new P<Array<T>>((inputStream: InputStream) => {

        const results: Array<T> = []

        const sep = options?.sep

        let occurrences = 0;

        while (true) {
            const parseResult = parser.createParser(inputStream)
            if (parseResult.success) {
                const parseSuccess = parseResult as ParseSuccess<T>
                results.push(parseSuccess.value)

                occurrences++;
                if (sep !== undefined) {
                    // Parse separator - If fails, break
                    const sepParseResult = sep.createParser(inputStream);
                    if (!sepParseResult.success) {
                        break;
                    }
                }
            } else {
                break;
            }
        }

        if (options) {
            if (options.min && occurrences < options.min) {
                return {success: false, position: inputStream.position, disallowBacktrack: false, expected: []}
            }
        }

        return {success: true, value: results, position: inputStream.position};
    })
}

function end(): P<void> {
    return new P<void>((inputStream: InputStream) => {
        if (inputStream.isEmpty()) {
            return {success: true, value: undefined, position: inputStream.position};
        }
        return {success: false, position: inputStream.position, disallowBacktrack: false, expected: []}
    });
}

type ElementTypeIfLengthOneOrZero<T extends any[]> = T['length'] extends 1 ? T[0] : (T['length'] extends 0 ? void : T);

type FilterOutVoid<T extends any[]> = T extends [infer Head, ...infer Rest]
    ? Head extends void
        ? FilterOutVoid<Rest>
        : [Head, ...FilterOutVoid<Rest>]
    : T;

function seq<T extends any[]>(...parsers: { [K in keyof T]: P<ElementTypeIfLengthOneOrZero<FilterOutVoid<T[K]>>> }): P<ElementTypeIfLengthOneOrZero<FilterOutVoid<T>>> {

    function removeVoidFromTuple<T extends any[]>(tuple: T): FilterOutVoid<T> {
        return tuple.filter((item) => item !== undefined) as FilterOutVoid<T>;
    }

    return new P((inputStream: InputStream) => {

        let results: ParseSuccess<any>[] = []

        for (const parser of parsers) {
            let parseResult: ParseResult<any> = parser.createParser(inputStream);

            if (parseResult.success) {
                const success = parseResult as ParseSuccess<any>

                results.push(success);
            } else {
                parseResult.disallowBacktrack = results.some(r => r.disallowBacktrack)
                return parseResult
            }
        }

        const filteredResults = removeVoidFromTuple(results.map(r => r.value) as T)

        return {
            success: true,
            value: filteredResults.length > 1 ? filteredResults : filteredResults[0],
            position: inputStream.position,
            disallowBacktrack: filteredResults.some(r => r.disallowBacktrack)
        };
    })
}


function opt<T>(parser: P<T>): P<Optional<T>> {

    return new P<Optional<T>>((inputStream: InputStream) => {

        const parseResult = parser.createParser(inputStream);
        if (parseResult.success) {
            const parseSuccess = parseResult as ParseSuccess<T>
            return {success: true, value: new Optional(parseSuccess.value), position: parseSuccess.position};
        }
        return {success: true, value: new Optional(undefined), position: inputStream.position}
    })
}


function index<T>(parser: P<T>): P<number> {

    return new P<number>((inputStream: InputStream) => {

        const parseResult = parser.createParser(inputStream);
        if (parseResult.success) {
            const parseSuccess = parseResult as ParseSuccess<T>
            return {success: true, value: inputStream.position, position: parseSuccess.position};
        }
        return {success: true, value: new Optional(undefined), position: inputStream.position}
    })
}

function either<T, U>(parserA: P<T>, parserB: P<U>): P<T | U> {
// @ts-ignore
    return new P<T | U>((inputStream: InputStream) => {

        const originalPosition = inputStream.position
        const result = parserA.createParser(inputStream);
        if (result.success) {
            return result;
        } else {

            const parseFailure = result as ParseFailure<T | U>

            if (!parseFailure.disallowBacktrack) {
                inputStream.position = originalPosition
                return parserB.createParser(inputStream)
            } else {
                return parseFailure
            }
        }

    })
}

function eitherMany<T>(...parsers: Array<P<T>>): P<T> {
// @ts-ignore
    return new P<T>((inputStream: InputStream) => {

        const originalPosition = inputStream.position
        for (let parser of parsers) {
            const parseResult = parser.createParser(inputStream)
            if (parseResult.success) {
                return parseResult
            }  else {
                const parseFailure = parseResult as ParseFailure<T>
                if (!parseFailure.disallowBacktrack) {
                    inputStream.position = originalPosition
                } else{
                    console.log("Backtrack disallowed")
                    console.log(inputStream.position)
                    return {success: false, position: inputStream.position, disallowBacktrack: true, expected: []}
                }
            }
        }

        return {success: false, position: inputStream.position, disallowBacktrack: false, expected: []}
    })
}

function lazy<T>(parserFunction: () => P<T>): P<T> {
    return new P<T>((inputStream: InputStream) => {
        return parserFunction().createParser(inputStream)
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
    opt,
    charIn,
    charsWhileIn,
    spaces
}