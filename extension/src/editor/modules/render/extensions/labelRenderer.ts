
import {
    append as svgAppend,
    create as svgCreate,
    classes as svgClasses,
} from 'tiny-svg';

import TemplateRenderer from "./templateRenderer";
import { isLabel, isFact } from "../../model/util";
import { Label } from "diagram-js/lib/model/Types";
import RenderingConstants from "../constants";

const SHAPE_TYPE = 'label';

export default class LabelRenderer extends TemplateRenderer<Label> {

    constructor(eventBus:any, renderOptions:any) {
        super(eventBus, renderOptions, SHAPE_TYPE);
    }

    canRender(element:any) : element is Label {
        return isLabel(element);
    }

    shouldRender(element: Label): boolean {
        return element.labelTarget !== undefined;
    }

    draw(visuals: any, element: Label) {

        var group = svgCreate("g", {
            class: RenderingConstants.css.RENDER_VISUALS_CLASS
        });

        // workout class name
        let className = "fact";
        if (element.derived){
            className = className + "-derived-label";
        } else {
            className = className + "-label";
        }

        //constants
        let src:any = element.labelTarget,
            x = 0,
            y = 3.5,
            transform = "";
        
        // handle alignment of source
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

        // find the content for the label
        if (element.content.length > 0){
            text.textContent = element.content;
        }
        if (src.derived && !element.derived){
            text.textContent = text.textContent+"  *";
        } else if (element.derived) {
            text.textContent = "*  "+ text.textContent;
        }

        // add layers to the visuals
        svgAppend(group, text);
        svgAppend(visuals, group);

        return visuals;
    }

};
