import {
    classes as svgClasses,
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    clone as svgClone
  } from 'tiny-svg';

import { assign } from 'min-dash';

import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {
    createLine
} from 'diagram-js/lib/util/RenderUtil';

import { ValueEntity, Entity } from '../model/entities';
import { unitWidth, unitHeight, Fact } from "../model/facts";
import { isLabel } from '../model/util';


const BORDER_COLOUR = "var(--render-border-colour)";
const SHAPE_FILL_COLOUR = "var(--render-fill-colour)";
const SHAPE_LABEL_COLOUR = "var(--render-label-colour)";
const ARC_STROKE_COLOUR = "var(--render-arc-stroke)";
const SUPPORTED_TYPES = [
    'entity', 'value', 'fact', 'connection', 'label'
];
var RENDER_PRIORITY = 1500;

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
                return self.drawConnection(visuals, element, attrs);
            } else {
                theconection(visuals, element, attrs);
            }
        });

        this.CONNECTION_STYLE = styles.style(
            { strokeWidth: 3, stroke: ARC_STROKE_COLOUR, strokeLinecap: 'round',
                strokeLinejoin: 'round', fill: 'none'}
        );
    }

    canRender(element){
        let type = element['type'] || "no-support";
        console.log("Type: ", type , SUPPORTED_TYPES.includes(type));
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
            let textLeft = (element.width / 2) - (element.width / 4);
            let textUpper = (element.height / 2) - 3.75;
            let textMiddle = (element.height / 2) + 1.25;
            let textLower = (element.height / 2) + 7.5;
            if (element.type === 'fact'){
                rx = 2.5;
                strokeWidth = 1.5;
            }
            if (element.type === 'value') {
                dashType = "18 6";
            }
            
            // draw bounding box
            if (element.type === 'fact'){
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
           

            if (element.type !== 'fact'){
                if (element.type === 'value'){
                    let upperText = svgCreate("text", {
                        x: textLeft, y: textMiddle, style:"text-align: center;",
                        textLength: element.width / 2, fill: SHAPE_LABEL_COLOUR
                    });
                    upperText.textContent = element.name;
                    svgAppend(group, upperText);
                } else {
                    // draw labels
                    let upperText = svgCreate("text", {
                        x: textLeft, y: textUpper, style:"text-align: center;",
                        textLength: element.width / 2, fill: SHAPE_LABEL_COLOUR
                    });
                    upperText.textContent = element.name;
                    svgAppend(group, upperText);

                    let lowerText = svgCreate("text", {
                        x: textLeft, y: textLower, style:"text-align: center;",
                        textLength: element.width / 2, fill: SHAPE_LABEL_COLOUR
                    });
                    lowerText.textContent = "(."+ element.ref + ")";
                    svgAppend(group, lowerText);
                }
                
            }
             


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
            svgAppend(visuals, group);
            return group;
    };    
    
    createShadowForShape(svgElement){
        var svg = svgClone(svgElement);
        svgAttr(svg,{
            opacity: 0.25,
            cx: parseFloat(svgElement.attributes.cx.nodeValue) + 2.5,
            cy: parseFloat(svgElement.attributes.cy.nodeValue) + 2.5
        });
        return svg;
    }

    drawLabel(visuals, label, attrs){
        var group = svgCreate("g", {
            class: "orm-visuals"
        });
        var text = svgCreate('text',
            {
                x: 0,
                y: 3.5,
                class: 'fact-label'
            }
        );
        if (label.content.length > 0){
            text.textContent = label.content;
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
        return text;
    }

    _drawSimpleConnection(visuals, connection, attrs){
        // handle the role that is being targeted
        const entity = connection.source;
        const fact = connection.target;
        let waypoints = Array.from(connection.waypoints);


        // now create the line using the updated waypoints
        var line = createLine(
            waypoints, assign({
                id: connection.id
            }, 
            this.CONNECTION_STYLE, attrs || {})
        );
    
        svgAppend(visuals, line);
        return line;
    }

    drawConnection(visuals, connection, attrs) {
        return this._drawSimpleConnection(
            visuals, connection, attrs
        );
    };

    
}

TSRenderer.$inject = [
    'eventBus',
    'styles',
    'canvas',
];