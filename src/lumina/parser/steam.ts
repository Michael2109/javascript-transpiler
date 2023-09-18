
class Stream {

    readonly characters: Array<string> = []

    position: number = 0;


    constructor(input: string) {
        for (let char of input) {
            this.characters.push(char)
        }
    }
}

export {Stream}