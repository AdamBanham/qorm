
import EventBus from 'diagram-js/lib/core/EventBus';

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

    prepareData(context:any) : object {
        return {
            source: context.source,
            mode: context.mode,
        };
    }

    move(event:any) {
    }

    click(event:any) {
    }

    end(event:any) {
    }

    cancel(event:any) {
    }

    cleanup(event:any) {
    }

    hover(event:any) {
    }

    out(event:any) {

    }
}

ConstraintHandler.$inject = [
    'eventBus'
];