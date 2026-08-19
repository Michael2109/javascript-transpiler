import {Optional} from "./optional";
import {InputStream} from "./input-stream";

const DIGIT_REGEX: RegExp = new RegExp(`^[0-9]+`);

type Parser<T> = (inputStream: InputStream) => ParseResult<T>

export function parse <T> (input: string, p: P<T>): ParseResult<T>{

    const inputStream = new InputStream(input)
    const parseResult = p.createParser(inputStream)

    if (parseResult.success) {
        return parseResult
    }

    // Report the deepest position reached across every alternative, not wherever
    // the outermost parser happened to give up after backtracking.
    const parseFailure = parseResult as ParseFailure<T>

    return {
        success: false,
        position: Math.max(inputStream.furthestFailurePosition, parseFailure.position),
        expected: inputStream.furthestExpected,
        disallowBacktrack: parseFailure.disallowBacktrack
    } as ParseFailure<T>
}

/**
 * Renders a parse failure for a human.
 *
 * Shared so the CLI and the test harness cannot drift apart. Line and column
 * reporting slots in here once InputStream tracks them.
 */
export function describeFailure<T>(parseFailure: ParseFailure<T>): string {

    const candidates = parseFailure.expected ?? []

    if (candidates.length === 0) {
        return `Syntax error at position ${parseFailure.position}`
    }

    // A long expected set is noise rather than help; show the first few.
    const MAX_REPORTED = 6

    const shown = candidates.slice(0, MAX_REPORTED).join(" or ")
    const rest = candidates.length > MAX_REPORTED ? `, or ${candidates.length - MAX_REPORTED} more` : ""

    return `Syntax error at position ${parseFailure.position}: expected ${shown}${rest}`
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

        const startPosition = inputStream.position

        for (let expectedChar of expected) {
            if (inputStream.peek() !== expectedChar) {

                // A partial match must give back everything it consumed, or the
                // stream is left inside a half-recognised token.
                inputStream.position = startPosition
                inputStream.recordFailure(startPosition, [`"${expected}"`])

                return {
                    success: false,
                    disallowBacktrack: false,
                    expected: [expected],
                    position: startPosition
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



function charPred(predicate: (char: string) => boolean): P<string> {
    return new P<string>((inputStream: InputStream) => {
        const char = inputStream.peek()

        if (char && predicate(char)) {

                inputStream.next()
                return {success: true, value: char,position: inputStream.position};

        }
        return {success: false, position: inputStream.position, disallowBacktrack: false, expected: []}
    });
}

function charWhile(predicate: (char: string) => boolean): P<string> {
    return new P<string>((inputStream: InputStream) => {

        let result = ""
        while(true) {
            const char = inputStream.peek()

            if (char && predicate(char)) {

                inputStream.next()

                result += char

            } else {
                return {success: true, value: result, position: inputStream.position};
            }
        }
    });
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
        inputStream.recordFailure(inputStream.position, [`[${expected}]`])
        return {success: false, position: inputStream.position, disallowBacktrack: false, expected: [expected]}
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


function spaces(required?: boolean): P<void> {
    if(required) {
        return quiet(capture(charsWhileIn(" \r\n\t"))
            .filter(chars => chars.length > 0)
            .map(() => undefined))
    } else {
        return quiet(charsWhileIn(" \r\n\t"))
    }
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

        // The end of the last complete element, excluding any separator that
        // followed it. Everything past this is given back when iteration stops.
        let lastCompletePosition = inputStream.position

        while (true) {
            const parseResult = parser.createParser(inputStream)
            if (parseResult.success) {
                const parseSuccess = parseResult as ParseSuccess<T>
                results.push(parseSuccess.value)

                occurrences++;
                lastCompletePosition = inputStream.position

                if (sep !== undefined) {
                    // Parse separator - If fails, break
                    const sepParseResult = sep.createParser(inputStream);
                    if (!sepParseResult.success) {
                        inputStream.position = lastCompletePosition
                        break;
                    }
                }
            } else {
                // Rewind past the failed element and any separator that preceded
                // it, so a trailing separator is not silently swallowed.
                inputStream.position = lastCompletePosition
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

/**
 * Consumes everything up to and including the first occurrence of `marker`.
 * Fails, consuming nothing, if the marker never appears.
 */
function until(marker: string): P<void> {
    return new P<void>((inputStream: InputStream) => {

        const startPosition = inputStream.position

        while (!inputStream.isEmpty()) {

            const attemptPosition = inputStream.position

            let matched = true
            for (const markerChar of marker) {
                if (inputStream.peek() !== markerChar) {
                    matched = false
                    break
                }
                inputStream.next()
            }

            if (matched) {
                return {success: true, value: undefined, position: inputStream.position}
            }

            inputStream.position = attemptPosition
            inputStream.next()
        }

        inputStream.position = startPosition
        inputStream.recordFailure(startPosition, [`"${marker}"`])

        return {success: false, position: startPosition, disallowBacktrack: false, expected: [marker]}
    })
}

function end(): P<void> {
    return new P<void>((inputStream: InputStream) => {
        if (inputStream.isEmpty()) {
            return {success: true, value: undefined, position: inputStream.position};
        }
        inputStream.recordFailure(inputStream.position, ["end of input"])
        return {success: false, position: inputStream.position, disallowBacktrack: false, expected: ["end of input"]}
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

        const startPosition = inputStream.position

        const parseResult = parser.createParser(inputStream);
        if (parseResult.success) {
            const parseSuccess = parseResult as ParseSuccess<T>
            return {success: true, value: new Optional(parseSuccess.value), position: parseSuccess.position};
        }

        // Absent, not partially present — rewind whatever the attempt consumed.
        inputStream.position = startPosition
        return {success: true, value: new Optional(undefined), position: startPosition}
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
                    return {success: false, position: inputStream.position, disallowBacktrack: true, expected: []}
                }
            }
        }

        return {success: false, position: inputStream.position, disallowBacktrack: false, expected: []}
    })
}

/**
 * Runs a parser without recording any of its failures. For parsers whose
 * internals are never worth reporting, such as whitespace.
 */
function quiet<T>(parser: P<T>): P<T> {
    return new P<T>((inputStream: InputStream) => {
        inputStream.suppressDepth++
        try {
            return parser.createParser(inputStream)
        } finally {
            inputStream.suppressDepth--
        }
    })
}

/**
 * Replaces everything a parser would contribute to the expected set with a
 * single name, reported at the position the parser started from.
 *
 * `identifier()` should say "identifier", not "[a-z] or [A-Z] or _".
 */
function label<T>(name: string, parser: P<T>): P<T> {
    return new P<T>((inputStream: InputStream) => {

        const startPosition = inputStream.position

        inputStream.suppressDepth++
        let parseResult: ParseResult<T>
        try {
            parseResult = parser.createParser(inputStream)
        } finally {
            inputStream.suppressDepth--
        }

        if (!parseResult.success) {
            inputStream.recordFailure(startPosition, [name])
        }

        return parseResult
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
    quiet,
    label,
    until,
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
    spaces,
    charPred,
    charWhile
}