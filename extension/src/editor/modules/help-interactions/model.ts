

export interface HelpChainModel {
    title: string;
    error: string;
    next: undefined | HelpChain;
}

export class HelpChain implements HelpChainModel {
    title: string;
    error: string;
    next: undefined | HelpChain;

    constructor(title: string, error: string, next?: HelpChain) {
        this.title = title;
        this.error = error;
        this.next = next;
    }
}

export class HelpChainBuilder {

    private _chain: HelpChain[] | undefined;

    constructor() {

    }

    create(title: string, error: string): HelpChainBuilder {
        this._chain = [];
        this._chain.push(new HelpChain(title, error));
        return this;
    }

    addNext(title: string, error: string): HelpChainBuilder {
        if (this._chain) {
            this._chain.push(new HelpChain(title, error));
        } else {
            throw new Error("Chain has not been initialized. Use create() first.");
        }
        return this;
    }

    build(): HelpChain {
        if (!this._chain || this._chain.length === 0) {
            throw new Error("Chain is empty. Use create() to initialize it.");
        }
        let first = this._chain[0];
        let helper = this._chain[0];
        for( let next of this._chain.slice(1) || [] ) {
            helper.next = next;
            helper = next;
        }
        this._chain = undefined;
        return first;
    }
}

export const DummyChain: HelpChain = new HelpChainBuilder()
    .create("First comment", "Error message one")
    .addNext("Second comment", "Error message two")
    .build();

DummyChain.next!.next = DummyChain;

export interface HelpStartEvent {
    chain: HelpChainModel
}

