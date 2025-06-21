import OrderingProvider from "diagram-js/lib/features/ordering/OrderingProvider.js";
import { isConnection} from "diagram-js/lib/util/ModelUtil";
import { isObjectification, isSubtype } from "../model/util";
import { isValueConstraint } from "../constraints/model/utils";


/**
 * Layering of elements in the ORM editor.
 * 
 * ----TOP----
 * -1, Entities, Facts, Constraints
 * 0, connections to above, Subtypes to above
 * 1, Objectifications,
 * 3, connections to above
 * ----BOTTOM----
 */
class OrmOrderingProvider extends OrderingProvider{

    constructor(eventbus, canvas){
        super(eventbus);
        this._canvas = canvas;
    }

    getOrdering(element, newParent){
        let index = -1;
        
        if (isConnection(element) || isSubtype(element)){
            index = 0;
        }
        if (isValueConstraint(element)){
            index = 1;
        }
        if (isObjectification(element)){
            index = 2;
            newParent = this._canvas.getRootElement();
        } 
        return {
            index: index,
            parent: newParent
        };
    }
}

OrmOrderingProvider.$inject = ['eventBus', 'canvas'];

export default OrmOrderingProvider;