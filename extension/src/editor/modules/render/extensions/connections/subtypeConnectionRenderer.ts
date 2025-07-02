import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
} from 'tiny-svg';

import {
    createLine
} from 'diagram-js/lib/util/RenderUtil';

import Canvas from 'diagram-js/lib/core/Canvas';

import RenderingConstants from "../../constants";
import { SUBTYPE_STYLE } from "../../constants";
import { isSubtype } from "../../../model/util";


import { OrmSubtypeConnection } from "../../../model/subtypes";
import TemplateRenderer from "../templateRenderer";

export const SHAPE_TYPE = "subtypeConnection";

export default class SubtypeConnectionRenderer extends TemplateRenderer<OrmSubtypeConnection> {

    static $inject: string[] = [ 'eventBus', 'renderingOptions', 'canvas' ];
    
    constructor(eventBus:any, renderOptions:any, canvas:Canvas) {
        super(eventBus, renderOptions, SHAPE_TYPE, "connection");

        // add definitions
        let defs = svgCreate("defs",{});
        this._setupMarkers(defs);
        // @ts-ignore
        svgAppend(canvas.getActiveLayer(), defs);
    }

    canRender(element:any): element is OrmSubtypeConnection {
        return isSubtype(element);
    }

    shouldRender(element: OrmSubtypeConnection): boolean {
        return true; // Always render role connections
    }

    _setupMarkers(defs:any) {
        let arrowMarker = svgCreate("marker", {
            id: "subtype-arrowhead",
            refX: 8,
            refY: 5,
            markerWidth: 4,
            markerHeight: 4,
            orient: 'auto-start-reverse',
            viewBox: "0 0 10 10"
        });

        let arrowPath = svgCreate("path", {
            d: "M 0 0 L 10 5 L 0 10 z",
            fill: RenderingConstants.css.MANDATORY_ROLE_STROKE
        });

        svgAppend(arrowMarker, arrowPath);
        svgAppend(defs, arrowMarker);
    }

    draw(visuals: SVGElement, element: OrmSubtypeConnection): SVGElement {
        // Placeholder for actual rendering logic
        let waypoints = Array.from(element.waypoints);
        let group = svgCreate("g", {
            class: RenderingConstants.classes.VISUAL_GROUP_CLASS
        });
        if (waypoints.length >= 2){
            var line = createLine(
                waypoints, Object.assign({
                    id: element.id
                }, 
                SUBTYPE_STYLE),
                RenderingConstants.connection.roundingRadius
            );
            svgAttr(line, {
                'marker-end': 'url(#subtype-arrowhead)'
            });
            svgAppend(group, line);
        }
        svgAppend(visuals, group);
        return visuals;
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