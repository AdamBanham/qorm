import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    clone as svgClone,
} from 'tiny-svg';

import EventBus from 'diagram-js/lib/core/EventBus';
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";

// constants
export const PRIORITY = 2000;
const DEBUG = true;
const DEBUG_OPACITY = 1;

/**
 * Template for adding a new renderer for a specific type of element.
 * Each renderer should target a specific type of element and only render
 * that type.
 * 
 * Classes extending this should implement the following methods:
 * * - canRender(element): boolean
 * * - shouldRender(element): boolean
 * * - draw(visuals, element): any
 * The draw method should return the SVG element with the drawn visuals.
 */
export default abstract class TemplateRenderer<T> extends BaseRenderer {

    static $inject: Array<string> = [ 'eventBus' ];
    _eventBus: EventBus;    

    constructor(eventBus:EventBus) {
        super(eventBus, PRIORITY);
        this._eventBus = eventBus;
        var that = this;
        eventBus.on([ 'render.shape' ], 2000, function(evt, context) {

            var element = context.element,
                visuals = context.gfx;

            if (that.canRender(element)) {
                if (!that.shouldRender(element)) {
                    return visuals;
                }
                visuals = that.draw(visuals, element);
                if (DEBUG) {
                    visuals = that.drawDebug(visuals, element);
                } 
                return visuals;
            } else {
                // return nothing to trigger low priority renderers
                return;
            }
        });
    }

    /**
     * Determines if the renderer can render the given element. Should only
     * target one known type of element.
     * @param element the element to check
     * @return true if the renderer can render the element
     */
    abstract canRender(element:any) : boolean;

    /**
     * Determines if the renderer should render svgelements for the targeted 
     * element type.
     * @param element the element to check
     * @return true if the renderer should render the element
     */
    abstract shouldRender(element:T) : boolean;

    /**
     * Draws the visuals for the given element.
     * @param visuals the SVG element to draw on
     * @param {T} element the element to draw
     * @return the SVG element with the drawn visuals
     */
    abstract draw(visuals:any, element:T) : any;

    /**
     * Draws debug visuals for the given element.
     * @param visuals 
     * @param element 
     */
    drawDebug(visuals:any, element:any): void {
        let dot = svgCreate("circle", {
            cx: (element.width / 2),
            cy: (element.height / 2),
            r: 5,
            fill: "red",
            stroke: "transparent",
            opacity: 0.25
        });
        svgAppend(visuals, dot);
        // add compontents to group and return
        svgAttr(visuals, {
            opacity: DEBUG_OPACITY
        });
        return visuals;
    }

    /**
     * Creates a shadow for the given SVG element.
     * @param svgElement the SVG element to create a shadow for
     * @return the SVG element with the shadow applied
     */
    createShadowForShape(svgElement: any): any {
        var svg = svgClone(svgElement);
        svgAttr(svg,{
            opacity: 0.125,
            transform: "translate(2.5, 3.5)",
        });
        return svg;
    }
}