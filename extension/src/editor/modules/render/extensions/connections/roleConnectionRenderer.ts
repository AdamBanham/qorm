import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
} from 'tiny-svg';

import {
    createLine
} from 'diagram-js/lib/util/RenderUtil';

import Canvas from 'diagram-js/lib/core/Canvas';

import { OrmConnection } from "../../../model/connections";
import RenderingConstants from "../../constants";
import { CONNECTION_STYLE } from "../../constants";
import TemplateRenderer from "../templateRenderer";
import { isRoleConnection } from "../../../model/util";

export const SHAPE_TYPE = "roleConnection";

export default class RoleConnectionRenderer extends TemplateRenderer<OrmConnection> {

    static $inject: string[] = [ 'eventBus', 'renderingOptions', 'canvas' ];

    constructor(eventBus:any, renderOptions:any, canvas:Canvas) {
        super(eventBus, renderOptions, SHAPE_TYPE, "connection");

        // add definitions
        let defs = svgCreate("defs",{});
        this._setupMarkers(defs);
        // @ts-ignore
        svgAppend(canvas.getActiveLayer(), defs);
    }

    canRender(element:any): element is OrmConnection {
        return isRoleConnection(element);
    }

    shouldRender(element: OrmConnection): boolean {
        return true; // Always render role connections
    }

    _setupMarkers(defs:any) {
        // use a base of 20 (abaritary, feels selected)
        let mandatory = svgCreate("marker", {
            id: "mandatory-role",
            refX: 10,
            refY: 5,
            markerHeight: 10,
            markerWidth: 10,
            viewbox: '0 0 10 10',
            orient: 'auto-start-reverse',
        });
        // the role to include
        svgAppend(mandatory, svgCreate("circle", {
            cx : 5, 
            cy : 5,
            r : 3,
            fill: RenderingConstants.css.MANDATORY_ROLE_COLOUR,
            stroke: RenderingConstants.css.MANDATORY_ROLE_STROKE,
            strokeWidth: 1,
        }));

        svgAppend(defs, mandatory);
    }

    draw(visuals: SVGElement, element: OrmConnection): SVGElement {
        // Placeholder for actual rendering logic
        // handle the role that is being targeted
        let waypoints = Array.from(element.waypoints);
        let group = svgCreate("g", {});

        if (waypoints.length >= 2){
            // now create the line using the updated waypoints
            var line = createLine(
                waypoints, Object.assign({
                    id: element.id
                }, 
                CONNECTION_STYLE),
                RenderingConstants.connection.roundingRadius
            );    
            svgAppend(group, line);
            
            if (element.mandatory){
                this._drawMandatory(
                    visuals, element, line
                );
            }
        }
        svgAppend(visuals, group);
        return visuals;
    }

    _drawMandatory(visuals: SVGElement, element: OrmConnection, line: SVGElement): void {
        // Draw the mandatory role marker
        svgAttr(line, {
            'marker-start': 'url(#mandatory-role)'
        });
    }

    /**
     * Draws a debug dot for each waypoint of the connection.
     * @param visuals 
     * @param element 
     */
    drawDebug(visuals: any, element: any) {
        for (let i = 0; i < element.waypoints.length; i++) {
            let dot = this._drawDebugDot(
                element.waypoints[i].x,
                element.waypoints[i].y
            );
            svgAppend(visuals, dot);
        }
        return visuals;
    }
}