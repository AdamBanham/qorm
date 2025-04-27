import BaseLayouter from "diagram-js/lib/layout/BaseLayouter";
import { getMid } from "diagram-js/lib/layout/LayoutUtil";

import { isEntity, isFact } from "../model/util";
import { unitHeight, unitWidth } from "../model/facts";

export default class OrmLayouter extends BaseLayouter {

    tolerance = 0.01;
    offsetTolerance = Math.max(unitHeight, unitWidth) * 1.2;

    constructor(){
        super();
    }

    nearby(pos, other){
        return Math.abs(pos.x - other.x) < this.offsetTolerance &&
            Math.abs(pos.y - other.y) < this.offsetTolerance;
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
     * @returns {Array, boolean} the new bends and if we added an item
     */
    suffixOrUpdate(bends, pos){
        if (bends.length === 0){
            return { mids: [pos], added: false};
        }
        if (bends.length === 1){
            let last = bends[0];
            if (this.nearlyEqual(last, pos)){
                return { mids:bends, added:false};
            } else {
                if (this.nearby(last, pos)){
                    return {mids: [pos], added:false};
                }
                return {mids:[last, pos], added:true};
            }
        }
        let last = bends[bends.length - 1];
        if (this.nearlyEqual(last, pos)){
            return {mids:bends, added:false};
        } else {
            if (this.nearby(last, pos)){
                return {mids:[...bends.slice(0,-1), pos], added:true};
            }
            return {mids:[...bends.slice(), pos], added:true};
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
        let lastEdit = connection.lastEdit || undefined;

        // has the connection been settled?
        if (!fact || !entity || role === undefined){
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

        let factConnectionPoint = undefined;
        let mids, added;
        if (fact.roles === 1){
            // if the fact has only one role then put the pivot
            // in the middle
            waypoints = [
                    Object.assign({}, srcPos),
                    ...bends,
                    Object.assign({}, tgtPos)
            ];
        } else {
            if (role === 0){
            // if its the first role then put the pivot to the left
            factConnectionPoint = { x: tgtPos.x - unitWidth, y: tgtPos.y};
            } else if (role === fact.roles - 1){
                // if its the last role then put the pivot to the right
                factConnectionPoint = { x: tgtPos.x + unitWidth, y: tgtPos.y};
            } else {
                // if its a middle role then put the pivot above or below
                if (tgtPos.y > srcPos.y){
                    factConnectionPoint =  { x: tgtPos.x, y: tgtPos.y - unitHeight };
                } else {
                    factConnectionPoint = { x: tgtPos.x, y: tgtPos.y + unitHeight };
                }
            }
            // update waypoints
            let ret = this.suffixOrUpdate(bends, 
                factConnectionPoint
            );
            mids = ret.mids;
            added = ret.added;
            waypoints = 
            [
                Object.assign({}, srcPos),
                ...mids,
                Object.assign({}, tgtPos)
            ];
        }
        // handle removing last pivot point for fact
        if (lastEdit !== undefined){
            // check that we have a new pivot point and it has added
            if (factConnectionPoint !== undefined && added){
                var remove = -1;
                var found = false;
                for (let wp of waypoints){
                    remove++;
                    if (this.nearlyEqual(wp, lastEdit)){
                        found = true;
                        break;
                    }
                }
                // if we found the previous pivot then remove it.
                if (found){
                    waypoints = waypoints.slice(0, remove)
                        .concat(
                            waypoints.slice(remove + 1)
                        );
                }
            }
            
        }
        // remember the last pivot point
        if (factConnectionPoint){
            connection.lastEdit = factConnectionPoint;
        }
        return waypoints;
    }
}

OrmLayouter.$inject = [
];