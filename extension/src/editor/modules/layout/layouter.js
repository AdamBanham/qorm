import BaseLayouter from "diagram-js/lib/layout/BaseLayouter";
import { Connection } from "diagram-js/lib/model/Types";
import { getMid } from "diagram-js/lib/layout/LayoutUtil";

import { isEntity, isFact } from "../model/util";
import { unitHeight, unitWidth } from "../model/facts";

export default class OrmLayouter extends BaseLayouter {

    constructer(){
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
        if (!isFact(fact) || !isEntity(entity)){
            console.error("error: unable to consider connection :: ", connection);
            return super.layoutConnection(connection, hints);
        }
        // work for waypoints
        // TODO: in future I may want to know about the last set
        // waypoints, so I can use them to calculate the new ones.
        let srcPos = getMid(entity);
        let tgtPos = fact.getCenterForRole(
            role
        );
        let waypoints = [ ];

        if (fact.roles === 1){
            // if the fact has only one role then put the pivot
            // to the left or right of the fact
            if (srcPos.x > tgtPos.x){
                waypoints = 
                [
                    Object.assign({}, srcPos),
                    { x: tgtPos.x + unitWidth, y: tgtPos.y},
                    Object.assign({}, tgtPos)
                ];
            }
            else {
                waypoints = 
                [
                    Object.assign({}, srcPos),
                    { x: tgtPos.x - unitWidth, y: tgtPos.y},
                    Object.assign({}, tgtPos)
                ];
            }
        } else if (role === 0){
            // if its the first role then put the pivot to the left
            waypoints = 
            [
                Object.assign({}, srcPos),
                { x: tgtPos.x - unitWidth, y: tgtPos.y},
                Object.assign({}, tgtPos)
            ];
        } else if (role === fact.roles - 1){
            // if its the last role then put the pivot to the right
            waypoints = 
                [
                    Object.assign({}, srcPos),
                    { x: tgtPos.x + unitWidth, y: tgtPos.y},
                    Object.assign({}, tgtPos)
                ];
        } else {
            // if its a middle role then put the pivot above or below
            if (tgtPos.y > srcPos.y){
                waypoints = 
                [
                    Object.assign({}, srcPos),
                    { x: tgtPos.x, y: tgtPos.y - unitHeight },
                    Object.assign({}, tgtPos)
                ];
            } else {
                waypoints = 
                [
                    Object.assign({}, srcPos),
                    { x: tgtPos.x, y: tgtPos.y + unitHeight },
                    Object.assign({}, tgtPos)
                ];
            }
        }
        return waypoints;
    }
}