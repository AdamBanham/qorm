import OrderingProvider from "diagram-js/lib/features/ordering/OrderingProvider.js"
import { ConnectionImpl } from "diagram-js/lib/model/"

class OrmOrderingProvider extends OrderingProvider{

    constructor(eventbus){
        super(eventbus)
    }

    getOrdering(element, newParent){
        if (element.waypoints){
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