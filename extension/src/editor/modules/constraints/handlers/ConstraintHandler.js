
/**
 * A abstract interface for constraint handlers.
 */
export default class ConstraintHandler {

    constructor(eventBus) {

    }

    precheck(context) {
        return true;
    }

    prepareData(context) {
        return {
            source: context.source,
            mode: context.mode,
        };
    }

    move(event) {
    }

    click(event) {
    }

    end(event) {
    }

    cancel(event) {
    }

    cleanup(event) {
    }

    hover(event) {
    }

    out() {
    }
}

ConstraintHandler.$inject = [
    'eventBus'
];