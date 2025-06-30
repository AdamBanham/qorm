import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    clone as svgClone,
    classes as svgClasses,
    transform
} from 'tiny-svg';
    
import { assign } from 'min-dash';

import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {
    createLine
} from 'diagram-js/lib/util/RenderUtil';

import { ValueEntity, Entity, unitWidth as entityWidth } from '../model/entities';
import { unitWidth, unitHeight, Fact } from "../model/facts";
import { isLabel, isConstraint, isUnitReference, isReferredReference, isValueReference, isSubtype, isObjectification, isFact } from '../model/util';
import { SUBTYPE_NAME } from '../model/subtypes';
import { OBJECTIFICATION_TYPE } from '../model/objectifiedRole';

const RENDER_VISUALS_CLASS = "orm-visuals";
const BORDER_COLOUR = "var(--render-border-colour)";
const SHAPE_FILL_COLOUR = "var(--render-fill-colour)";
const SHAPE_LABEL_COLOUR = "var(--render-label-colour)";
const ARC_STROKE_COLOUR = "var(--render-arc-stroke)";
const CONSTRAINT_COLOUR = "var(--render-simple-constraint)";
const CONSTRAINT_EDIT_COLOUR = "var(--render-simple-constraint-editing)";
const CONSTRAINT_EDIT_FAIL = "var(--render-simple-constraint-fail)";
const MANDATORY_ROLE_COLOUR = "var(--render-mandatory-role-fill)";
const MANDATORY_ROLE_STROKE = "var(--render-madatory-role-stroke)";
const OBJECTIFICATION_FILL_COLOUR = "var(--render-objectification-fill)";
const OBJECTIFICATION_RECT_CLASS = "fact-objectified";

const NO_HIT_CLASS = "djs-hit-no-move";

const SUPPORTED_TYPES = [
    'entity', 'value', 'fact', 'connection', 'label', 'constraint',
    SUBTYPE_NAME, OBJECTIFICATION_TYPE
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
                if (isObjectification(element)){
                    return self.drawObjectification(visuals, element, attrs);
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
            fill: MANDATORY_ROLE_COLOUR,
            stroke:  MANDATORY_ROLE_STROKE,
            strokeWidth: 1,
        }));

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

        svgAppend(defs, mandatory);
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
            var group = svgCreate("g", {
                class: "orm-visuals"
            });
            
            // draw constants
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
        let src = label.labelTarget,
            x = 0,
            y = 3.5,
            transform = "";
        if (isFact(src)){
            if (src.isVertical()){
                x = 3.5;
                y = 0;
                transform = "rotate(-90, 0, 0)";
            } else {
                x = 0;
                y = 3.5;
            }
        }
        var text = svgCreate('text',
            {
                x,
                y,
                class: className,
                transform,
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

    _drawMandatory(visuals, connection, line){
        svgAttr(line, {
            'marker-start': 'url(#mandatory-role)'
        });
    }

    drawObjectification(visuals, objectification, attrs) {
        svgClasses(visuals).add(NO_HIT_CLASS);
        let group = svgCreate("g", {});
        svgClasses(group)
            .add(RENDER_VISUALS_CLASS);
        let width = objectification.width,
            height = objectification.height;

        let box = svgCreate("rect", {
                x: 0,
                y: 0,
                rx: 2.5,
                width: width,
                height: height,
                fill: OBJECTIFICATION_FILL_COLOUR,
                stroke: BORDER_COLOUR,
                strokeWidth: 2,
                'stroke-dasharray': ""
        });
        svgClasses(box)
            .add(OBJECTIFICATION_RECT_CLASS);
        svgAppend(group, box);
        svgAppend(visuals, group);
        return group;
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