const DIGIT_REGEX: RegExp = new RegExp(`^[0-9]+`);

abstract class Parser<T> {
    abstract parse(input: string): ParseResult<T>
/*
    map<U>(transform: (value: T) => U): LazyParser<U> {

        const t = this;
        return () => {
            return new class extends Parser<U> {
                parse(input: string): ParseResult<U> {
                        const parseResult: ParseResult<T> = t.parse(input);
                        const transformedValue: U = parseResult.success ? transform(parseResult.value) : undefined;

                        return {
                            success: parseResult.success,
                            value: transformedValue,
                            remaining: parseResult.remaining
                        };
                }
            }
        }
    }*/

    filter(applyFilter: (value: T) => boolean): () =>Parser<T> {

        const t = this;

        return () => {
            return new class extends Parser<T> {
                parse(input: string): ParseResult<T> {
                        const parseResult: ParseResult<T> = t.parse(input);
                        const success: boolean = applyFilter(parseResult.value);

                        return {success: success, value: parseResult.value, remaining: parseResult.remaining};

                }
            }
        }
    }
}

class LazyParser<T> {
    public readonly parserFn: () => Parser<T>;

    constructor(parserFn: () => Parser<T>) {
        this.parserFn = parserFn;
    }

    map<U>(transform: (value: T) => U): LazyParser<U> {

        const t = this;

        const p: Parser<U> = new class extends Parser<U> {
            parse(input: string): ParseResult<U> {
                const parseResult: ParseResult<T> = t.parserFn().parse(input);
                const transformedValue: U = parseResult.success ? transform(parseResult.value) : undefined;

                return {
                    success: parseResult.success,
                    value: transformedValue,
                    remaining: parseResult.remaining
                };
            }
        }

        return new LazyParser<U>(() => p)
    }

    filter(applyFilter: (value: T) => boolean): LazyParser<T> {

        const t = this;

        return new LazyParser<T>(() =>
             new class extends Parser<T> {
                parse(input: string): ParseResult<T> {
                    const parseResult: ParseResult<T> = t.parserFn().parse(input);
                    const success: boolean = applyFilter(parseResult.value);

                    return {success: success, value: parseResult.value, remaining: parseResult.remaining};

                }
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

type ElementTypeIfLengthOne<T extends any[]> = T['length'] extends 1 ? T[0] : T;

type FilterOutVoid<T extends any[]> = T extends [infer Head, ...infer Rest]
    ? Head extends void
        ? FilterOutVoid<Rest>
        : [Head, ...FilterOutVoid<Rest>]
    : T;

function removeVoidFromTuple<T extends any[]>(tuple: T): FilterOutVoid<T> {
    return tuple.filter((item) => item !== undefined) as FilterOutVoid<T>;
}

function seq<T extends any[]>(...parsers: { [K in keyof T]: LazyParser<ElementTypeIfLengthOne<FilterOutVoid<T[K]>>> }): LazyParser<ElementTypeIfLengthOne<FilterOutVoid<T>>> {

    return new LazyParser(()  => new class extends Parser<ElementTypeIfLengthOne<FilterOutVoid<T>>> {
        parse(input: string):  ParseResult<ElementTypeIfLengthOne<FilterOutVoid<T>>> {

            let remainingInput = input;

            let results: any[] = []

            for (const parser of parsers) {
                let parseResult: ParseResult<any> = parser.parserFn().parse(remainingInput);
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

        }
    })

}

function charIn(charPattern: string): LazyParser<string> {
    return new LazyParser<string>(() =>
        new class extends Parser<string> {
            parse(input: string): ParseResult<string> {
                const match = input.match(`^[${charPattern}]`);

                if (match) {
                    return {success: true, value: match[0], remaining: input.slice(match[0].length)};
                }

                return {success: false, value: undefined, remaining: input};
            }
        })
}


function charsWhileIn(chars: string): LazyParser<string> {
    return new LazyParser<string>(() =>
         new class extends Parser<string> {
            parse(input: string): ParseResult<string> {
                    let remainingInput = input;

                    let result = ""
                    while (true) {
                        const parseResult = charIn(chars).parserFn().parse(remainingInput)
                        remainingInput = parseResult.remaining;

                        if (parseResult.success) {
                            result += parseResult.value
                        } else {
                            return {success: true, value: result, remaining: remainingInput}
                        }
                    }
            }
        })
}

function spaces(): LazyParser<void> {
    return new LazyParser<void>(() =>{
        return new class extends Parser<void> {
            parse(input: string): ParseResult<void> {
                    return charsWhileIn(" \r\n").map(() => {}).parserFn().parse(input)
            }
        }
    })
}

function capture(parser: LazyParser<void>): LazyParser<string> {
    return new LazyParser<string>(() =>
        new class extends Parser<string> {
            parse(input: string): ParseResult<string> {
                    const parseResult = parser.parserFn().parse(input)

                    if (parseResult.success) {
                        return {success: true, value: parseResult.stringValue, remaining: parseResult.remaining}
                    } else {
                        return {success: false, value: undefined, remaining: input}
                    }
            }
        })
}

function str(expected: string): LazyParser<void> {

    return new LazyParser<void>(() =>
         new class extends Parser<void> {
            parse(input: string):  ParseResult<void> {

                    if (input.startsWith(expected)) {
                        return {
                            success: true,
                            value: undefined,
                            stringValue: expected,
                            remaining: input.slice(expected.length)
                        };
                    }
                    return {success: false, value: undefined, remaining: input};

            }
        })
}

function regex(expected: RegExp): LazyParser<string> {

    return new LazyParser<string>(() => new class extends Parser<string> {
            parse(input: string): ParseResult<string> {

                    const match = input.match(expected);

                    if (match) {
                        return {success: true, value: match[0], remaining: input.slice(match[0].length)};
                    }

                    return {success: false, value: undefined, remaining: input};
                }
        })
}

function digit(): LazyParser<string> {
    return regex(DIGIT_REGEX)
}

function end(): LazyParser<void> {
    return new LazyParser<void>(() =>
         new class extends Parser<void> {
            parse(input: string): ParseResult<void> {

                    if (input === "") {
                        return {success: true, value: undefined, remaining: input};
                    }
                    return {success: false, value: undefined, remaining: input};
                }
        });
}

function either<T, U>(parserA:LazyParser<T>, parserB: LazyParser<U>): LazyParser<T | U> {

    return new LazyParser<T | U>(() => new class extends Parser<T | U> {
            parse(input: string):  ParseResult<T | U> {

                    const result = parserA.parserFn().parse(input);
                    if (result.success) {
                        return result;
                    } else if (!result.disallowBacktrack) {
                        return parserB.parserFn().parse(input)
                    } else {
                        return {success: false, value: undefined, remaining: result.remaining}
                    }
                }

        })
}

function eitherMany<T>(...parsers: Array<LazyParser<T>>): LazyParser<T> {

    return new LazyParser<T>(() =>
         new class extends Parser<T> {
            parse(input: string): ParseResult<T> {

                    for (let parser of parsers) {
                        const parseResult = parser.parserFn().parse(input)
                        if (parseResult.success) {
                            return parseResult
                        }
                    }

                    return {success: false, value: undefined, remaining: input}
                }
            })
}

function cut<T>(parser: LazyParser<T>): LazyParser<T> {
 return new LazyParser<T>(() => new class extends Parser<T> {
         parse(input: string):  ParseResult<T> {
                 const result = parser.parserFn().parse(input);
                 if (result.success) {
                     return result;
                 } else {
                     result.disallowBacktrack = true;
                     return result
                 }
             }
     })
}

function rep<T>(parser: LazyParser<T>, options?: { min?: number, max?: number, sep?: LazyParser<unknown> }): LazyParser<Array<T>> {
    return new LazyParser(() =>
         new class extends Parser<Array<T>> {
            parse(input: string):  ParseResult<Array<T>> {


                    const results: Array<T> = []
                    let remainingInput = input;

                    const sep = options?.sep

                    while (true) {
                        const parseResult = parser.parserFn().parse(remainingInput)
                        if (parseResult.success) {
                            results.push(parseResult.value)
                            remainingInput = parseResult.remaining;

                            if (sep !== undefined) {
                                // Parse separator - If fails, break
                                const sepParseResult = sep.parserFn().parse(remainingInput);
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

            }

})

}

function opt<T>(parser: Parser<T>): LazyParser<T | undefined> {
    return new LazyParser<T | undefined>(() =>
         new class extends Parser<T | undefined> {
            parse(input: string):   ParseResult<T | undefined> {


                    const parseResult = parser.parse(input);
                    if (parseResult.success) {
                        return parseResult;
                    }
                    return {success: true, value: undefined, remaining: parseResult.remaining}
                }
    })
}

function index<T>(parser: Parser<T>): () =>  Parser<T> {
return () => {
    return new class extends Parser<T> {
        parse(input: string): ParseResult<T> {
                const result = parser.parse(input);
                if (result.success) {
                    return result;
                } else {
                    result.disallowBacktrack = true;
                    return result
                }
        }
    }
}
}

export {Parser, LazyParser, ParseResult, capture, either, eitherMany, cut, seq, digit, str, end, rep, regex, opt, charIn, charsWhileIn, spaces}