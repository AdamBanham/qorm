import BaseLayouter from "diagram-js/lib/layout/BaseLayouter";
import { Connection } from "diagram-js/lib/model/Types";
import { getMid } from "diagram-js/lib/layout/LayoutUtil";

import { isEntity, isFact } from "../model/util";
import { unitHeight, unitWidth } from "../model/facts";

export default class OrmLayouter extends BaseLayouter {

    tolerance = 0.01;

    constructer(){
    }

    /**
     * Whether two positions are nearly the same.
     * @param {*} pos one position
     * @param {*} other other position
     * @returns {boolean} whether they are nearly exaclty the same position
     */
    nearlyEqual(pos, other){
        return Math.abs(pos.x - other.x) < this.tolerance &&
            Math.abs(pos.y - other.y) < this.tolerance;
    }

    /**
     * prefix or update the last position in the bends array.
     * @param {Array} bends the current wayspoints
     * @param {*} pos a new position
     * @returns {Array} the new bends
     */
    suffixOrUpdate(bends, pos){
        if (bends.length === 0){
            return [pos];
        }
        let last = bends[bends.length - 1];
        if (this.nearlyEqual(last, pos)){
            return bends;
        } else {
            return [...bends, pos];
        }
    }

    /**
     * 
     * @param {Connection} connection 
     * @param {*} hints 
     */
    layoutConnection(connection, hints){
        hints = hints || {};

        let fact = connection.target;
        let entity = connection.source;
        let role = connection.role;

        // has the connection been settled?
        if (!fact || !entity){
            return super.layoutConnection(connection, hints);
        }

        // check if the connection is a fact-entity connection
        // [rules should stop this from happening]
        if (!isFact(fact) || !isEntity(entity)){
            console.error("error: unable to consider connection :: ", connection);
            return super.layoutConnection(connection, hints);
        }
        // work for waypoints
        let srcPos = getMid(entity);
        let tgtPos = fact.getCenterForRole(
            role
        );
        let waypoints = [];
        let bends;
        if (connection.waypoints){
            bends = connection.waypoints.slice(1, -1);
        } else {
            bends = [];
        }

        if (fact.roles === 1){
            // if the fact has only one role then put the pivot
            // to the left or right of the fact
            waypoints = [
                    Object.assign({}, srcPos),
                    ...bends,
                    Object.assign({}, tgtPos)
            ];
        } else if (role === 0){
            // if its the first role then put the pivot to the left

            waypoints = 
            [
                Object.assign({}, srcPos),
                ...this.suffixOrUpdate(bends, 
                    { x: tgtPos.x - unitWidth, y: tgtPos.y}
                ),
                Object.assign({}, tgtPos)
            ];
        } else if (role === fact.roles - 1){
            // if its the last role then put the pivot to the right
            waypoints = 
                [
                    Object.assign({}, srcPos),
                    ...this.suffixOrUpdate(bends,
                        { x: tgtPos.x + unitWidth, y: tgtPos.y}
                    ),
                    Object.assign({}, tgtPos)
                ];
        } else {
            // if its a middle role then put the pivot above or below
            if (tgtPos.y > srcPos.y){
                waypoints = 
                [
                    Object.assign({}, srcPos),
                    ...this.suffixOrUpdate(bends,
                        { x: tgtPos.x, y: tgtPos.y - unitHeight }
                    ),
                    Object.assign({}, tgtPos)
                ];
            } else {
                waypoints = 
                [
                    Object.assign({}, srcPos),
                    ...this.suffixOrUpdate(bends,
                        { x: tgtPos.x, y: tgtPos.y + unitHeight }
                    ),
                    Object.assign({}, tgtPos)
                ];
            }
        }
        return waypoints;
    }
}