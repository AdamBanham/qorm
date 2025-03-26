import OrderingProvider from "diagram-js/lib/features/ordering/OrderingProvider.js"
import  { isConnection } from "diagram-js/lib/util/ModelUtil";

class OrmOrderingProvider extends OrderingProvider{

    constructor(eventbus){
        super(eventbus)
    }

    getOrdering(element, newParent){
        if (isConnection(element)){
            return {
                index: 1,
                parent: newParent
            }
        } else {
            return {
                index: -1,
                parent: newParent
            }
        }
    }
}

OrmOrderingProvider.$inject = ['eventBus']

export default OrmOrderingProvider