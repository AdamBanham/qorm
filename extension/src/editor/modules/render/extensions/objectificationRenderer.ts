import {
    append as svgAppend,
    create as svgCreate,
    classes as svgClasses,
} from 'tiny-svg';

import TemplateRenderer from "./templateRenderer";
import { isObjectification } from "../../model/util";
import { ObjectifiedRole } from "../../model/objectifiedRole";
import RenderingConstants from "../constants";

const SHAPE_TYPE = "objectification";

export default class ObjectificationRenderer extends TemplateRenderer<ObjectifiedRole> {

    constructor(eventBus:any, renderingOptions:any) {
        super(eventBus, renderingOptions, SHAPE_TYPE);
    }

    canRender(element:any): element is ObjectifiedRole {
        return isObjectification(element);
    }

    shouldRender(element: ObjectifiedRole): boolean {
        return true;
    }

    draw(visuals: any, element: ObjectifiedRole) {
        svgClasses(visuals).add(RenderingConstants.classes.NO_HIT_CLASS);
        let group = svgCreate("g", {
            class: RenderingConstants.classes.VISUAL_GROUP_CLASS
        });

        // constants
        let width = element.width,
            height = element.height;

        // create the objectification rectangle
        let box = svgCreate("rect", {
                x: 0,
                y: 0,
                rx: 2.5,
                width: width,
                height: height,
                fill: RenderingConstants.css.OBJECTIFICATION_FILL_COLOUR,
                stroke: RenderingConstants.css.BORDER_COLOUR,
                strokeWidth: 2,
                'stroke-dasharray': ""
        });
        svgClasses(box)
            .add(RenderingConstants.classes.OBJECTIFICATION_RECT_CLASS);
        
        // prepare visuals for renderer
        svgAppend(group, box);
        svgAppend(visuals, group);

        return visuals;
    }
};