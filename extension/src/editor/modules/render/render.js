import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    clone as svgClone,
  } from 'tiny-svg';

import { assign } from 'min-dash';

import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {
    createLine
} from 'diagram-js/lib/util/RenderUtil';

import { ValueEntity, Entity, unitWidth as entityWidth } from '../model/entities';
import { unitWidth, unitHeight, Fact } from "../model/facts";
import { isLabel, isConstraint, isUnitReference, isReferredReference, isValueReference, isSubtype } from '../model/util';
import { SUBTYPE_NAME } from '../model/subtypes';


const BORDER_COLOUR = "var(--render-border-colour)";
const SHAPE_FILL_COLOUR = "var(--render-fill-colour)";
const SHAPE_LABEL_COLOUR = "var(--render-label-colour)";
const ARC_STROKE_COLOUR = "var(--render-arc-stroke)";
const CONSTRAINT_COLOUR = "var(--render-simple-constraint)";
const CONSTRAINT_EDIT_COLOUR = "var(--render-simple-constraint-editing)";
const CONSTRAINT_EDIT_FAIL = "var(--render-simple-constraint-fail)";
const MANDATORY_ROLE_COLOUR = "var(--render-mandatory-role-fill)";
const MANDATORY_ROLE_STROKE = "var(--render-madatory-role-stroke)";
const SUPPORTED_TYPES = [
    'entity', 'value', 'fact', 'connection', 'label', 'constraint',
    SUBTYPE_NAME
];
var RENDER_PRIORITY = 1500;
const DEBUG = true;
const DEBUG_OPACITY = 1;

export default class TSRenderer extends  BaseRenderer {
    
    constructor(eventBus, styles, canvas, textRender) {
        super(eventBus, 1);
        var self = this;

        var renderPriority = RENDER_PRIORITY;

        const thedraw = super.drawShape;
        eventBus.on([ 'render.shape' ], renderPriority, function(evt, context) {
            var type = evt.type,
                element = context.element,
                visuals = context.gfx,
                attrs = context.attrs;

            if (self.canRender(element)) {
                if (isLabel(element)){
                    return self.drawLabel(visuals, element, attrs);
                }
                if (isConstraint(element)){
                    return self._drawContraint(visuals, element, attrs);
                }
                return self.drawShape(visuals, element, attrs);
            } else {
                return thedraw(visuals, element, attrs);
            }
        });
        const theconection = super.drawConnection;
        eventBus.on(['render.connection' ], renderPriority - 50, function(evt, context) {
            var type = evt.type,
                element = context.element,
                visuals = context.gfx,
                attrs = context.attrs;

            if (self.canRender(element)) {
                if ( isSubtype(element)){
                    return self.drawSubtypeConnection(visuals, element, attrs);
                }
                return self.drawConnection(visuals, element, attrs);
            } else {
                theconection(visuals, element, attrs);
            }
        });

        this.CONNECTION_STYLE = styles.style(
            { strokeWidth: 3, stroke: ARC_STROKE_COLOUR, strokeLinecap: 'round',
                strokeLinejoin: 'round', fill: 'none'}
        );
        this.SUBTYPE_STYLE = styles.style(
            { strokeWidth: 5, stroke: MANDATORY_ROLE_STROKE, strokeLinecap: 'round',
                strokeLinejoin: 'round', fill: 'none'}
        );

        // add markers
        let defs = svgCreate("defs",{});
        this._setupMarkers(defs);
        svgAppend(canvas.getActiveLayer(), defs);
    }

    _setupMarkers(defs){
        let marker = svgCreate("marker",{
            id: "mandatory-role",
            refX: 22,
            refY: 5,
            markerHeight: 10,
            markerWidth: 10,
            viewbox: '0 0 10 10',
            orient: 'auto-start-reverse',

        });
        let mandatory = svgCreate("circle", {
            cx : 5, 
            cy : 5,
            r : 2,
            fill: "red"
        });
        svgAppend(marker, mandatory);

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
            fill: MANDATORY_ROLE_STROKE
        });

        svgAppend(arrowMarker, arrowPath);
        svgAppend(defs, arrowMarker);

        svgAppend(defs, marker);
    }

    canRender(element){
        let type = element['type'] || "no-support";
        return SUPPORTED_TYPES.includes(type);
    }

    /**
     * 
     * @param {*} visuals 
     * @param {ValueEntity | Entity | Fact} element 
     * @param {*} attrs 
     * @returns 
     */
    drawShape(visuals, element, attrs) {
            // init
            var svgElements;
            var group = svgCreate("g", {
                class: "orm-visuals"
            });
            
            // draw 

            let rx = 10 ;
            let strokeWidth = 3;
            let dashType = "";
            let textLeft = Math.floor(element.width * 0.05);
            let centerText = Math.floor(element.width * 0.5);
            let textUpper = (element.height / 2) - 3.75;
            let textMiddle = (element.height / 2) + 1.25;
            let textLower = (element.height / 2) + 15.5;
            if (element.type === 'fact'){
                rx = 2.5;
                strokeWidth = 1.5;
            }
            if (element.type === 'value') {
                dashType = "18 6";
            }
            
            // draw bounding box
            if (element.type === 'fact'){
                // draw the objectification
                if (element.objectified){
                    let box = svgCreate("rect", {
                        class: "fact-objectified",
                        x: -10,
                        y: -10 - (10 * element.constraints.length),
                        rx: rx,
                        width: element.width + 20,
                        height: element.height + 20 + 15 + (10 * element.constraints.length),
                        fill: "none",
                        stroke: BORDER_COLOUR,
                        strokeWidth: strokeWidth * 2,
                        'stroke-dasharray': dashType
                    });
                    svgAppend(group, box);
                }
                // draw the fact roles
                let x = 0;
                let y = 0;
                for (let i = 0; i < element.roles; i++){
                    let box = svgCreate("rect", {
                        'stroke-dasharray': dashType,
                        class: "fact-role",
                        rx: rx,
                        width: unitWidth,
                        height: unitHeight,
                        x: x,
                        y: 0
                    });
                    svgAppend(group, box);
                    if (element.hovered && i === element.hoveredRole){
                        let classer = element.isFilled(i) ? 
                            "fact-role-filled" : "fact-role-free";
                        box = svgCreate("rect", {
                            class: classer,
                            rx: rx,
                            width: unitWidth,
                            height: unitHeight,
                            x: x,
                            y: 0
                        });
                        svgAppend(group, box);
                    }
                    x = x + unitWidth;
                }
            } else {
                let box = svgCreate("rect", {
                    fill: SHAPE_FILL_COLOUR,
                    stroke: BORDER_COLOUR,
                    strokeWidth: strokeWidth,
                    'stroke-dasharray': dashType,
                    rx: rx,
                    width: element.width,
                    height: element.height
                });
                svgAppend(group, box);
            }
           
            const maxTextWidth = Math.floor(element.width * 0.9);
            const maxLetters = Math.floor(maxTextWidth / 6);

            const adjustText = (text) => {
                if (!text){
                    return "";
                }
                if (text.length > maxLetters){
                    let newText = text.substring(0, maxLetters - 1) + "...";
                    return newText;
                } else {
                    return text;
                }
            };
            const adjustLowerText = (text) => {
                if (text.length > maxLetters){
                    let newText = text.substring(0, maxLetters - 1) + "...)";
                    return newText;
                } else {
                    return text;
                }
            };

            let style = "text-align: center;";
            style += `text-anchor: middle;`;
            style += `font-size: 12px;`;
            if (element.type !== 'fact'){
                // draw upper text
                if (isValueReference(element)){
                    let upperText = svgCreate("text", {
                        x: centerText, y: textMiddle,
                        fill: SHAPE_LABEL_COLOUR,
                        style: style,
                    });
                    upperText.textContent = adjustText(element.name);
                    svgAppend(group, upperText);
                } else {
                    let upperText = svgCreate("text", {
                        x: centerText, y: textUpper, 
                        fill: SHAPE_LABEL_COLOUR,
                        style: style,
                    });
                    upperText.textContent = adjustText(element.name);
                    svgAppend(group, upperText);
                }
                // draw lower text
                if (isUnitReference(element)){
                    let lowerText = svgCreate("text", {
                        x: centerText, y: textLower,
                        fill: SHAPE_LABEL_COLOUR,
                        style: style,
                    });
                    lowerText.textContent = "("+ element.ref + ":" + element.meta +")";
                    lowerText.textContent = adjustLowerText(lowerText.textContent);
                    svgAppend(group, lowerText);
                } else if (isReferredReference(element)){
                    let lowerText = svgCreate("text", {
                        x: centerText, y: textLower,
                        fill: SHAPE_LABEL_COLOUR,
                        style: style,
                    });
                    lowerText.textContent = "(."+ element.ref + ")";
                    lowerText.textContent = adjustLowerText(lowerText.textContent);
                    svgAppend(group, lowerText);
                }
            } else {
                if (element.objectified && element.objectifiedName){
                    let upperText = svgCreate("text", {
                        x: centerText, y:  - 10 - (10 * element.constraints.length) - 12.5,
                        class: "fact-objectified-label",
                        style: style,
                    });
                    upperText.textContent = '"'+element.objectifiedName+'!"';
                    svgAppend(group, upperText);
                }
            }
             
            // draw arrow for the verbialisation
            if (element.type === 'fact' && element.towards){
                let transform = "";
                if (element.towards === "left"){
                    transform = transform + "rotate(180) translate(-15, -25) scale(6) ";
                } else {
                    transform = transform + `translate(${element.width - 15}, 0) scale(6) `;
                }
                let arrowhead = svgCreate("path", {
                    d: 'm0 0v3.804C0 3.999 0 4 .157 3.864L1.764 2.234C2.002 2.002 2.001 2 1.749 1.749L.078.092C0-.001 0 0 0 .108z',
                    'stroke-linecap': "round",
                    class: "fact-verb-arrow",
                    transform: transform
                });
               svgAppend(group, arrowhead);
            }

            if (DEBUG){
                 // draw center for debug
                let dot = svgCreate("circle", {
                    cx: (element.width / 2),
                    cy: (element.height / 2),
                    r: 5,
                    fill: "red",
                    stroke: "transparent",
                    opacity: 0.25
                });
                svgAppend(group, dot);
                // add compontents to group and return
                svgAttr(group, {
                    opacity: DEBUG_OPACITY
                });
            }
           
            svgAppend(visuals, this.createShadowForShape(group));
            svgAppend(visuals, group);
            return group;
    };    
    
    createShadowForShape(svgElement){
        var svg = svgClone(svgElement);
        svgAttr(svg,{
            opacity: 0.125,
            transform: "translate(2.5, 3.5)",
        });
        return svg;
    }

    drawLabel(visuals, label, attrs){
        var group = svgCreate("g", {
            class: "orm-visuals"
        });
        let className = "fact";
        if (label.derived){
            className = className + "-derived-label";
        } else {
            className = className + "-label";
        }
        var text = svgCreate('text',
            {
                x: 0,
                y: 3.5,
                class: className
            }
        );
        if (label.content.length > 0){
            text.textContent = label.content;
        }
        if (label.labelTarget.derived && !label.derived){
            text.textContent = text.textContent+"  *";
        } else if (label.derived) {
            text.textContent = "*  "+ text.textContent;
        }
        // draw center for debug
        let dot = svgCreate("circle", {
            cx: (0),
            cy: (0),
            r: 5,
            fill: "red",
            stroke: "transparent",
            opacity: 0.25
        });
        svgAppend(group, text);
        svgAppend(group, dot);
        svgAppend(visuals, group);
        return group;
    }

    _drawContraint(visuals, constraint, attrs){
        var group = svgCreate("g", {
            class: "orm-visuals"
        });
        // draw segments 
        let curr_x = 0;
        let next_x = unitWidth;
        let color = (constraint.editing) ? 
        ( constraint.valid ? CONSTRAINT_EDIT_COLOUR : CONSTRAINT_EDIT_FAIL) 
        : CONSTRAINT_COLOUR;
        for(let i = 0; i < constraint.roles; i++){
            let dash = (constraint.isRoleConstrainted(i)) 
                ? "0" : "2.5";
            let line = svgCreate("line", {
                x1: curr_x,
                y1: 1.5,
                x2: next_x,
                y2: 1.5,
                stroke: color,
                'stroke-width': 2,
                'stroke-dasharray': dash,
            });
            svgAppend(group, line);
            curr_x = next_x;
            next_x = next_x + unitWidth;
        }
        svgAppend(visuals, group);
        return group;
    }

    angleBetweenPoints(pos, other){
        let x = pos.x - other.x; 
        let y = pos.y - other.y; 
        return Math.atan2(y, x) * (180 / Math.PI);
    }

    _drawMandatory(visuals, connection, line){
        let angle = this.angleBetweenPoints(
            connection.waypoints[0],
            connection.waypoints[1]
        );
        // work out the extra need for the corners with the hypo is the longest
        let between = Math.abs(angle % 90);
        let extra = 5;
        if (between > 45){
            extra = extra * (1 - ((between-45)/45.0));
        } else {
            extra = extra * ((between/45.0));
        }
        // use a base of 20 (abaritary, feels selected)
        let marker = svgCreate("marker", {
            id: "mandatory-role-"+connection.id,
            refX: 20 + 2 + extra,
            refY: 5,
            markerHeight: 10,
            markerWidth: 10,
            viewbox: '0 0 10 10',
            orient: 'auto-start-reverse',
        });
        // the role to include
        svgAppend(marker, svgCreate("circle", {
            cx : 5, 
            cy : 5,
            r : 3,
            fill: MANDATORY_ROLE_COLOUR,
            stroke:  MANDATORY_ROLE_STROKE,
            strokeWidth: 1,
        }));
        let defs = svgCreate("defs", {});
        // append to line
        svgAppend(defs, marker);
        svgAppend(visuals, defs);
        svgAttr(line, {
            'marker-start': 'url(#mandatory-role-'+connection.id +')'
        });
    }

    _drawSimpleConnection(visuals, connection, attrs){
        // handle the role that is being targeted
        let waypoints = Array.from(connection.waypoints);
        let group = svgCreate("g", {});

        if (waypoints.length >= 2){
        // now create the line using the updated waypoints
        var line = createLine(
            waypoints, assign({
                id: connection.id
            }, 
            this.CONNECTION_STYLE, attrs || {})
        );    
        svgAppend(group, line);
        
        if (connection.mandatory){
            this._drawMandatory(
                visuals, connection, line
            );
        }

        }
        svgAppend(visuals, group);
        return visuals;
    }

    drawConnection(visuals, connection, attrs) {
        return this._drawSimpleConnection(
            visuals, connection, attrs
        );
    };

    drawSubtypeConnection(visuals, connection, attrs) {
        let waypoints = Array.from(connection.waypoints);
        let group = svgCreate("g", {});
        if (waypoints.length >= 2){
            var line = createLine(
                waypoints, assign({
                    id: connection.id
                }, 
                this.SUBTYPE_STYLE, attrs || {})
            );
            svgAttr(line, {
                'marker-end': 'url(#subtype-arrowhead)'
            });
            svgAppend(group, line);
        }
        svgAppend(visuals, group);
        return visuals;
    };
}

TSRenderer.$inject = [
    'eventBus',
    'styles',
    'canvas',
];