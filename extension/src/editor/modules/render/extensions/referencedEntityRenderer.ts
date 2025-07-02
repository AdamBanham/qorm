import {
    append as svgAppend,
    create as svgCreate,
} from 'tiny-svg';

import { Entity } from "../../model/entities";
import { isExactlyEntity } from "../../model/util";
import { isUnitReference, isReferredReference} from '../../model/util';
import TemplateRenderer from "./templateRenderer";
import RenderingConstants from "../constants";

export const SHAPE_TYPE = "entity";

export default  class ReferencedEntityRenderer extends TemplateRenderer<Entity> {

    constructor(eventBus:any, renderOptions:any) {
        super(eventBus, renderOptions, SHAPE_TYPE);
    }

    canRender(element:any): element is Entity {
        return isExactlyEntity(element);
    }

    shouldRender(element: Entity): element is Entity {
        return true;
    }

    draw(visuals: SVGElement, element: Entity): SVGElement {
        // container for all visuals
        var group = svgCreate("g", {
                class: RenderingConstants.classes.VISUAL_GROUP_CLASS
        });

        // draw constants
        let rx = 10 ;
        let strokeWidth = 3;
        let dashType = "";
        let centerText = Math.floor(element.width * 0.5);
        let textUpper = (element.height / 2) - 3.75;
        let textLower = (element.height / 2) + 15.5;

        // draw bounding box
        let box = svgCreate("rect", {
            fill: RenderingConstants.css.SHAPE_FILL_COLOUR,
            stroke: RenderingConstants.css.BORDER_COLOUR,
            strokeWidth: strokeWidth,
            'stroke-dasharray': dashType,
            rx: rx,
            width: element.width,
            height: element.height
        });
        svgAppend(group, box);

        // handle text for entity
        const maxTextWidth = Math.floor(element.width * 0.9);
        const maxLetters = Math.floor(maxTextWidth / 6);
        const adjustText = (text:string) => {
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
        const adjustLowerText = (text:string) => {
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

        // draw upper text
        let upperText = svgCreate("text", {
            x: centerText, y: textUpper, 
            fill: RenderingConstants.css.SHAPE_LABEL_COLOUR,
            style: style,
        });
        upperText.textContent = adjustText(element.name);
        svgAppend(group, upperText);
        // draw lower text
        if (isUnitReference(element)){
            let lowerText = svgCreate("text", {
                x: centerText, y: textLower,
                fill: RenderingConstants.css.SHAPE_LABEL_COLOUR,
                style: style,
            });
            lowerText.textContent = "("+ element.ref + ":" + element.meta +")";
            lowerText.textContent = adjustLowerText(lowerText.textContent);
            svgAppend(group, lowerText);
        } else if (isReferredReference(element)){
            let lowerText = svgCreate("text", {
                x: centerText, y: textLower,
                fill: RenderingConstants.css.SHAPE_LABEL_COLOUR,
                style: style,
            });
            lowerText.textContent = "(."+ element.ref + ")";
            lowerText.textContent = adjustLowerText(lowerText.textContent);
            svgAppend(group, lowerText);
        }

        // add layers to visuals
        svgAppend(visuals, this.createShadowForShape(group));
        svgAppend(visuals, group);

        return visuals;
    }

}