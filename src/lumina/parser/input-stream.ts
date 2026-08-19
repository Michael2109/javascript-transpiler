
class InputStream {

    readonly originalInput: string

    readonly characters: Array<string> = []

    position: number = 0;

    /**
     * The furthest position any parser has failed at, and what was expected
     * there.
     *
     * Backtracking means the stream position after a failed parse says nothing
     * about where the input actually went wrong — the useful position is the
     * deepest one reached across every alternative tried. Recording it here is
     * the only way to keep it, since the stream is rewound on the way back out.
     */
    furthestFailurePosition: number = -1;

    furthestExpected: Array<string> = [];

    /**
     * While positive, failures are not recorded. Used to keep the internals of
     * whitespace and labelled parsers out of the expected set — nobody wants to
     * be told the compiler expected `[\n\t ]`.
     */
    suppressDepth: number = 0;

    constructor(input: string) {
        this.originalInput = input
        for (let char of input) {
            this.characters.push(char)
        }
    }

    /**
     * Notes that a parser failed at a position, expecting one of `expected`.
     * Later failures at the same position accumulate; shallower ones are ignored.
     */
    recordFailure(position: number, expected: Array<string>): void {

        if (this.suppressDepth > 0) {
            return
        }

        if (position > this.furthestFailurePosition) {
            this.furthestFailurePosition = position
            this.furthestExpected = expected.slice()
            return
        }

        if (position === this.furthestFailurePosition) {
            for (const candidate of expected) {
                if (!this.furthestExpected.includes(candidate)) {
                    this.furthestExpected.push(candidate)
                }
            }
        }
    }

    peek(): string  | undefined{
        if(!this.isEmpty()) {
           return  this.characters[this.position]
        }
   return undefined
    }

    /**
     * Skip to the next character
     */
    next(): void {
        if(!this.isEmpty()){
            this.position ++;
        }
    }

    remaining(): string {
        let result = ""
        for(let i = this.position; i < this.characters.length; i++ ){
            result += this.characters[i]
        }
        return result
    }

    isEmpty(): boolean {
        return this.position === this.characters.length
    }
}

export {InputStream}