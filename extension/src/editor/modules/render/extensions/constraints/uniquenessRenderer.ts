import {
    append as svgAppend,
    create as svgCreate
} from 'tiny-svg';

import TemplateRenderer from '../templateRenderer';
import EventBus from 'diagram-js/lib/core/EventBus';

// types
import { SimpleConstraint } from "../../../model/constraints";
import { isConstraint } from '../../../model/util';

// sizing
import { unitWidth } from "../../../model/facts";

// constants
import RenderingConstants from '../../constants';
export const SHAPE_TYPE = 'uniquenessConstraint';

export default class UniquenessRenderer extends TemplateRenderer<SimpleConstraint> {

    constructor(eventBus: EventBus, renderingOptions: any) {
        super(eventBus, renderingOptions, SHAPE_TYPE);
    }

    canRender(element: any): element is SimpleConstraint {
        return isConstraint(element);
    }

    shouldRender(element: SimpleConstraint): boolean {
        return true;
    }

    draw(visuals:any, constraint:SimpleConstraint){
        var group = svgCreate("g", {
            class: RenderingConstants.classes.VISUAL_GROUP_CLASS,
        });
        // draw segments 
        let curr_x = 0;
        let next_x = unitWidth;
        let x1, y1, x2, y2;
        let color = (constraint.editing) ? 
        ( constraint.valid ? 
            RenderingConstants.css.CONSTRAINT_EDIT_COLOUR : 
            RenderingConstants.css.CONSTRAINT_EDIT_FAIL) 
        : RenderingConstants.css.CONSTRAINT_COLOUR;
        for(let i = 0; i < constraint.roles; i++){
            if (constraint.src && constraint.src.isVertical()){
                x1 = 1.5;
                y1 = curr_x;
                x2 = 1.5;
                y2 = next_x;
            } else {
                x1 = curr_x;
                y1 = 1.5;
                x2 = next_x;
                y2 = 1.5;
            }
            let dash = (constraint.isRoleConstrainted(i)) 
                ? "0" : "2.5";
            let line = svgCreate("line", {
                x1,
                y1,
                x2,
                y2,
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

}