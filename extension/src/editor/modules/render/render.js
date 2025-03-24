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
                thedraw(visuals, element, attrs);
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
            { strokeWidth: 3, stroke: '#303c4a', strokeLinecap: 'round',
                strokeLinejoin: 'round', fill: 'none'});
        this.INTERNAL_SHAPE_STYLE = styles.style(
            { fill: '#f5f5f5', stroke: '#222222', strokeWidth: 2 }
        );
        this.STARTING_SHAPE_STYLE = styles.style(
            { fill: '#67f5a9', stroke: '#222222', strokeWidth: 2 }
        );
        this.ENDING_SHAPE_STYLE = styles.style(
            { fill: '#f58867', stroke: '#222222', strokeWidth: 2 }
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

    drawShape(visuals, element, attrs) {
            // init
            var svgElements;
            var group = svgCreate("g", {});
            
            // draw 
            console.log("drawing element :: ", element);
            

        
            return super.drawShape(visuals, element, attrs);
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