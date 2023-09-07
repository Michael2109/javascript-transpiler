class Optional<T> {
    private readonly value?: T;

    constructor(value?: T) {
        this.value = value;
    }

    isPresent(): boolean {
        return this.value !== undefined && this.value !== null;
    }

    get(): T | undefined {
        if (this.isPresent()) {
            return this.value;
        } else {
            return undefined;
        }
    }

    orElse(defaultValue: T): T {
        return this.isPresent() ? this.value! : defaultValue;
    }

    ifPresent(callback: (value: T) => void): void {
        if (this.isPresent()) {
            callback(this.value!);
        }
    }
}

export {Optional}