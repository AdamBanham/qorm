
import EventBus from 'diagram-js/lib/core/EventBus';

export interface ConstraintContext extends MouseEvent {
    source: any;
    mode: string;
    x: number;
    y: number;
}

/**
 * A abstract interface for constraint handlers.
 */
export default class ConstraintHandler {

    _builder?: any;
    static $inject: Array<string>;

    constructor(eventBus:EventBus) {

    }

    setBuilder(builder:any) : ConstraintHandler{
        this._builder = builder;
        return this;
    }

    precheck(context:any) {
        return true;
    }

    prepareData(context:any) : ConstraintContext {
        // @ts-ignore
        return {
            source: context.source,
            mode: context.mode,
        };
    }

    move(event:ConstraintContext) {
    }

    click(event:ConstraintContext) {
    }

    end(event:ConstraintContext) {
    }

    cancel(event:ConstraintContext) {
    }

    cleanup(event:ConstraintContext) {
    }

    hover(event:ConstraintContext) {
    }

    out(event:ConstraintContext) {

    }
}

ConstraintHandler.$inject = [
    'eventBus'
];