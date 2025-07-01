import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    clone as svgClone,
} from 'tiny-svg';

import EventBus from 'diagram-js/lib/core/EventBus';
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import RenderOptions from '../../renderOptions/renderOptions';

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

    static $inject: Array<string> = [ 'eventBus', 'renderingOptions' ];
    shapeType:string = "shape";
    _eventBus: EventBus;    
    _renderingOptions: RenderOptions;

    constructor(eventBus:EventBus, renderingOptions:RenderOptions, shapeType?:string) {
        super(eventBus, PRIORITY);
        this._eventBus = eventBus;
        this._renderingOptions = renderingOptions;
        if (shapeType) {
            this.shapeType = shapeType;
        }
        var that = this;
        eventBus.on([ 'render.shape' ], 2000, function(evt, context) {

            var element = context.element,
                visuals = context.gfx;

            if (that.canRender(element)) {
                if (!that.shouldRender(element)) {
                    return visuals;
                }
                visuals = that.draw(visuals, element);
                // @ts-ignore
                if (that._renderingOptions.getShapeDebugDot(that.shapeType)) {
                    visuals = that.drawDebug(visuals, element);
                } 
                // @ts-ignore
                let opacity = that._renderingOptions.computeShapeOpacity(that.shapeType);
                if (opacity < 1) {
                    visuals = that.handleOpacity(visuals, opacity);
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
    drawDebug(visuals:any, element:any): any {
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
     * Handles the opacity of the given SVG element.
     * @param visuals the SVG element to handle opacity for
     * @param opacity the opacity to set
     * @return the SVG element with the opacity set
     */
    handleOpacity(visuals:any, opacity:number): any {
        svgAttr(visuals, 
            {
                opacity: opacity
            }
        );
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