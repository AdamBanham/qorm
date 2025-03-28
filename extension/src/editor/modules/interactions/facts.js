import EventBus from "diagram-js/lib/core/EventBus";
import OrmModeling from "../modeling/modeler";
import { isFact } from "../model/util";


export default class FactInteractions {

    /**
     * 
     * @param {EventBus} eventBus 
     * @param {OrmModeling} modeling 
     */
    constructor(events, modeling){
        var that = this;
        
        events.on('element.mousemove', 
            (event) => {
                if (isFact(event.element)) {
                    let fact = event.element;
                    fact.hovered = true;
                    fact.hoveredRole = 
                        fact.findNearestRoleUsingPosX(
                            event.originalEvent.layerX
                        );
                    modeling.sendUpdate(fact);
                }
            }
        );

        events.on('element.out', 
            (event) => {
                if (isFact(event.element)) {
                    let fact = event.element;
                    fact.hovered = false;
                    modeling.sendUpdate(fact);
                }
            }
        );
    }
}

FactInteractions.$inject = ['eventBus', 'modeling'];