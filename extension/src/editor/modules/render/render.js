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


const BORDER_COLOUR = "var(--render-border-colour)";
const SHAPE_FILL_COLOUR = "var(--render-fill-colour)";
const SHAPE_LABEL_COLOUR = "var(--render-label-colour)";
const ARC_STROKE_COLOUR = "var(--render-arc-stroke)";
var RENDER_PRIORITY = 1500;
const LABEL_COLOUR = "#01031b";
const INNER_ICON_FILL_COLOUR = "#222222";
const MARKED_COLOR = "#ebdf3f";
const TEXT_STYLE = {
      fontFamily: 'Arial, sans-serif',
      fontSize: 8,
      fontWeight: 'normal',
      textLength: 50,
      textAnchor: 'middle',
      dominantBaseline: 'middle'
};

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
        console.log("draw :: testing :: ", element);
        let type = element['type'] | "";
        if (type in ['entity', 'value', 'fact']){
            return true;
        }
        return false;
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
            var group = svgCreate("g", {});
            
            // draw 
            console.log("drawing element :: ", element);
            console.log("drawing element:: attrs::", attrs)

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
                    console.log("drawing box :: ", i , " and :: ", element);
                    let box = svgCreate("rect", {
                        fill: SHAPE_FILL_COLOUR,
                        stroke: BORDER_COLOUR,
                        strokeWidth: strokeWidth,
                        'stroke-dasharray': dashType,
                        rx: rx,
                        width: unitWidth,
                        height: unitHeight,
                        x: x,
                        y: 0
                    });
                    console.log("drawing box :: ", box);
                    svgAppend(group, box);
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

    drawStateLabel(element){
        var text = svgCreate('text',
            assign({
                x: stateRadius,
                y: stateRadius,
                fill: LABEL_COLOUR,
            }, TEXT_STYLE)
        )

        if (!isInternalState(element)){
            svgAttr(text,
                {
                fill: "#F8F8FF"
            })
        }
        if (element.stateLabel.length > 0)
            text.textContent = element.stateLabel
        else 
        text.textContent = element.id
        return text
    }

    _drawSimpleConnection(visuals, connection, attrs){
        var line = createLine(
            connection.waypoints, assign({
                id: connection.id
            }, 
            this.CONNECTION_STYLE, attrs || {})
        );
        var waypoints = connection.waypoints.slice(0,2).map(p => {
            return {x:p.x, y:p.y};
        });
    
        svgAppend(visuals, line);
        return line;
    }

    drawConnection(visuals, connection, attrs) {
        console.log("drawing connection :: ", connection);
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