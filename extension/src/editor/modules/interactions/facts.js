import EventBus from "diagram-js/lib/core/EventBus";
import Canvas from "diagram-js/lib/core/Canvas";

import OrmModeling from "../modeling/modeler";
import { isFact } from "../model/util";
import { transformToViewbox } from "../utils/canvasUtils";


export default class FactInteractions {

    /**
     * 
     * @param {EventBus} eventBus 
     * @param {OrmModeling} modeling 
     * @param {Canvas} canvas
     */
    constructor(events, modeling, canvas){
        var that = this;
        
        events.on('element.mousemove', 
            (event) => {
                if (isFact(event.element)) {
                    let transform = transformToViewbox(
                        canvas.viewbox(),
                        {
                            x: event.originalEvent.layerX,
                            y: event.originalEvent.layerY
                        }
                    );
                    // handle higlight hover for fact availablity
                    let fact = event.element;
                    fact.hovered = true;
                    fact.hoveredRole = 
                        fact.findNearestRoleUsingPosX(
                            transform.x
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

FactInteractions.$inject = ['eventBus', 'modeling', 'canvas'];