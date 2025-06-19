import OrderingProvider from "diagram-js/lib/features/ordering/OrderingProvider.js"
import { isConnection} from "diagram-js/lib/util/ModelUtil";
import { isObjectification } from "../model/util";


/**
 * Layering of elements in the ORM editor.
 * 
 * ----TOP----
 * 0, Entities, Facts, Constraints
 * 1, connections to above, Subtypes to above
 * 2, Objectifications,
 * 3, connections to above
 * ----BOTTOM----
 */
class OrmOrderingProvider extends OrderingProvider{

    constructor(eventbus, canvas){
        super(eventbus);
        this._canvas = canvas;
    }

    getOrdering(element, newParent){
        let index = -2;
        if (isConnection(element)){
            index = -1;
        }
        if (isObjectification(element)){
            index = 0;
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