
class InputStream {

    readonly originalInput: string

    readonly characters: Array<string> = []

    position: number = 0;


    constructor(input: string) {
        this.originalInput = input
        for (let char of input) {
            this.characters.push(char)
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