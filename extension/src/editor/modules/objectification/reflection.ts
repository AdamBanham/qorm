import EventBus from "diagram-js/lib/core/EventBus";
import { Fact } from "../model/facts";
import { isFact } from "../model/util";

export default class ObjectificationReflection {
    static $inject = ['eventBus', 'modeling'];
    private readonly _modeling:any;

    constructor(eventBus:EventBus, modeling:any) {

        this._modeling = modeling;  

        eventBus.on('shape.move.end', (event) => {
            let data = event as any;
            let shape = data.shape;
            if (this.checkFact(shape)) {
                setTimeout(() => this.processObjectification(shape), 5);
            }
            return event;
        });

        eventBus.on('constraint.builder.simple.end', (event) => {
            let data = event as any;
            let shape = data.fact;
            if (this.checkFact(shape)) {
                setTimeout(() => this.processObjectification(shape), 5);
            }
            return event;
        });

        eventBus.on('element.changed', (event) => {
            let data = event as any;
            let shape = data.element;
            if (this.checkFact(shape)) {
                setTimeout( () => this.processObjectification(shape), 5);
            }
            return event;
        });
    }

    checkFact(shape:any) : shape is Fact {
        if ( isFact(shape) && shape.objectified ) {
            return true;
        }
        return false;
    }

    processObjectification(fact:Fact) {
        if (fact.objectification){
            fact.objectification.update();
            let objectification = fact.objectification;
            setTimeout(
                () => {
                    this._modeling.sendUpdate(objectification);
                    for(let out of objectification.outgoing) {
                        this._modeling.layoutConnection(out);
                    }
                }
            , 5 );
        }
    }
}

ObjectificationReflection.$inject = ['eventBus', 'modeling'];
