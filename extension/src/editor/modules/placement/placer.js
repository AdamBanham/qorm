import ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import { isConnection } from "diagram-js/lib/util/ModelUtil";
import { ShapeLike } from "diagram-js/lib/model";

export default class Placer {

    /**
     * A service that handles finding a free placement for new
     * elements.
     * @param {ElementRegistry} elementRegistry 
     */
    constructor(elementRegistry) {
        this._elementRegistry = elementRegistry;
        this.last_right = {};
    }

    /**
     * Returns the next free position to the right of the source
     * @param {ShapeLike} source 
     * @param {ShapeLike} target 
     */
    place(source, target) {
        let toRight = this._elementRegistry.filter(
            (item) => 
                source.x < item.x 
                && item.id !== source.id 
                && item.id !== target.id
                && !isConnection(item)
        );
        let pos = {x: target.x, y: target.y};
        let min_dist = target.height * 1.25;
        let close = toRight.filter((item) => {
            let dist = this.getDistanceTo(pos, item);
            return dist <= min_dist;
        });
        let upper = Object.assign({}, pos);
        let lower = Object.assign({}, pos);
        if (!this.last_right[source.id]){
            this.last_right[source.id] = 0;
        }
        let side = this.last_right[source.id];
        while(close.length > 0) {
            if ((side % 2) === 0){
                upper.y -= min_dist;
                close = toRight.filter((item) => {
                    let dist = this.getDistanceTo(upper, item);
                    return dist <= min_dist;
                });
                if (close.length === 0) {
                    pos = upper;
                }
            } else {
                lower.y += min_dist;
                close = toRight.filter((item) => {
                    let dist = this.getDistanceTo(lower, item);
                    return dist <= min_dist;
                });
                if (close.length === 0) {
                    pos = lower;
                }
            }
            side += 1;
        }
        this.last_right[source.id] = side;
        return pos;
    }

    /**
     * Computes the distance between elements.
     * @param {ShapeLike} element 
     * @param {ShapeLike} target 
     * @returns {number} the distance between the two elements
     */
    getDistanceTo(element, target) {
        const dx = target.x - element.x;
        const dy = target.y - element.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

Placer.$inject = ['elementRegistry'];