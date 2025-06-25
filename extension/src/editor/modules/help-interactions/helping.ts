import EventBus from 'diagram-js/lib/core/EventBus';
import Canvas from 'diagram-js/lib/core/Canvas';

import { HelpChainModel } from './model';

export type HelpPrefix = 'help';
export type HelpSuffix = 'start' | 'error' | 'next' | 'end';
export type HelpEvents = `${HelpPrefix}.${HelpSuffix}`;

const contentDivId = 'help-interactions';
const errorDivId = 'help-interactions-error';

import { DummyChain, HelpStartEvent } from './model';

/**
 * This module provides interactions for the help system in the editor.
 */
export default class HelpInteractions {

    static $inject: string[] = [ 'eventBus', 'canvas' ];
    _chain: HelpChainModel | undefined;
    _bus:EventBus;
    _canvas:Canvas;

    _contentDiv!: HTMLElement;
    _contentText!: Element;
    _errorDiv!: HTMLElement;
    _errorText!: Element;

    constructor(bus: EventBus, canvas: Canvas) {
        this._bus = bus;
        this._canvas = canvas;

        this.init();

        this._bus.on('help.start', this.start.bind(this));
        this._bus.on('help.error', this.error.bind(this));
        this._bus.on('help.next', this.next.bind(this));
        this._bus.on('help.end', this.end.bind(this));

        // For testing purposes, we can use a dummy chain
        setTimeout( 
            () => this._bus.fire('help.start', {
            chain: DummyChain
            })
        , 5000);
        setTimeout( 
            () => this._bus.fire('help.error')
        , 10000);
        setTimeout( 
            () => this._bus.fire('help.next')
        , 15000);
        setTimeout( 
            () => this._bus.fire('help.error')
        , 20000);
        setTimeout( 
            () => this._bus.fire('help.end')
        , 25000);
    }

    init(){
        this._contentDiv = document
            .getElementById(contentDivId)!;
        this._contentText = this._contentDiv
            ?.getElementsByClassName("content")[0]!;
        this._errorDiv = document
            .getElementById(errorDivId)!;
        this._errorText = this._errorDiv
            ?.getElementsByClassName("content")[0]!;
    }

    reset() {
        this._contentDiv.classList.remove('open');
        this._errorDiv.classList.remove('open');
        this._contentDiv.classList.add('close');
        this._errorDiv.classList.add('close');
        this._contentText.textContent = '';
        this._errorText.textContent = '';
    }

    fire(event: HelpEvents, context: any) {
        if (this._bus) {
            this._bus.fire(event, context);
        } else {
            console.warn("Event bus is not initialized.");
        }
    }

    start(context:HelpStartEvent){
        this.reset();
        this._chain = context.chain;
        if (this._chain) {
            this._contentDiv.classList.add('open');
            this._contentDiv.classList.remove('close');
            this._contentText.textContent = this._chain.title;
        } else {
            console.warn("No help chain provided.");
        }
    }

    error() {
        if (this._chain) {
            this._errorDiv.classList.add('open');
            this._errorDiv.classList.remove('close');
            this._errorText.textContent = this._chain.error;
        } else {
            console.warn("No help chain available for error display.");
        }
    }

    next() {
        if (this._chain && this._chain.next) {
            this._chain = this._chain.next;
            this.reset();
            setTimeout(() => {
                this._contentDiv.classList.add('open');
                this._contentDiv.classList.remove('close');
                this._contentText.textContent = this._chain!.title;
            }, 100);
            
        } else {
            console.warn("No next help chain available.");
        }
    }

    end() {
        this.reset();
        this._chain = undefined;
        console.log("Help interaction ended.");
    }
}