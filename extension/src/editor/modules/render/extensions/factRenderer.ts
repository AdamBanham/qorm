import {
    append as svgAppend,
    create as svgCreate,
    classes as svgClasses
} from 'tiny-svg';

import TemplateRenderer from "./templateRenderer";

// types 
import { Fact, unitHeight, unitWidth } from "../../model/facts";
import { isFact } from "../../model/util";
import RenderingConstants from "../constants";
import { SimpleConstraint } from '../../model/constraints';

export default class FactRenderer extends TemplateRenderer<Fact> {

    constructor(eventBus: any, renderingOptions: any) {
        super(eventBus, renderingOptions, 'fact');
    }

    canRender(element: any): element is Fact {
        return isFact(element);
    }

    shouldRender(element: Fact): boolean {
        return true;
    }

    draw(visuals: SVGElement, element: Fact): SVGElement {
        var group = svgCreate("g", {
                class: RenderingConstants.classes.VISUAL_GROUP_CLASS,
        });
        
        // setup 
        let rx = 2.5;
        let dashType = "";
        let centerText = Math.floor(element.width * 0.5);

        // draw roles for fact
        let x = 0;
        let y = 0;
        const isVertical = element.alignment === "vertical";
        
        for (let i = 0; i < element.roles; i++){
            let box = svgCreate("rect", {
                'stroke-dasharray': dashType,
                class: RenderingConstants.classes.FACT_ROLE_CLASS,
                rx: rx,
                width: unitWidth,
                height: unitHeight,
                x: x,
                y: y
            });
            svgAppend(group, box);

            // handle whether the role is hovered 
            // highlight based on "mode" of highlighting
            // TODO: this should react to constraint building or 
            //       uniqueness constraint building
            if (element.hovered && i === element.hoveredRole!){
                let attrs = {
                    rx: rx,
                    width: unitWidth,
                    height: unitHeight,
                    x: x,
                    y: y
                };
                let cover = this._handleHighlighting(element, attrs, i);
                svgAppend(group, cover);
            }
            
            if (isVertical) {
                y = y + unitHeight;
            } else {
                x = x + unitWidth;
            }
        }

        // handle the label text
        let style = "text-align: center;";
        style += `text-anchor: middle;`;
        style += `font-size: 12px;`;

        if (element.objectified && element.objectifiedName){
            let upperText;
            let offset =  - 10 - (10 * element.uniqueness.length) - 12.5;

            // adjust for vertical alignment
            if (element.isVertical()){
                centerText = Math.floor(element.height * 0.5);
                upperText = svgCreate("text", {
                    x: offset , y:   centerText,
                    class: RenderingConstants.classes.OBJECTIFICATION_LABEL_CLASS,
                    style: style,
                    transform: `rotate(-90, ${offset}, ${centerText})`,
                });
            } else {
                upperText = svgCreate("text", {
                    x: centerText, y:  - 10 - (10 * element.uniqueness.length) - 12.5,
                    class: RenderingConstants.classes.OBJECTIFICATION_LABEL_CLASS,
                    style: style,
                });
            }

            upperText.textContent = '"'+element.objectifiedName+'!"';
            svgAppend(group, upperText);
        }

        // draw arrow for the verbialisation
        if (element.towards){
            let transform = "";
            if (element.isVertical()){
                transform += " rotate(90)";
            }
            if (element.towards === "left"){
                if (element.isVertical()){
                    transform += `rotate(180) translate(${(unitHeight/-2) - 2.5}, 0)`;
                } else {
                    transform += "rotate(180) translate(-15, -25)";
                }
            } else {
                if (element.isVertical()){
                    transform += ` translate(${element.height - 15}, -23.5)`;
                } else {
                    transform += ` translate(${element.width - 15}, 0)`;
                }
            }
            transform += " scale(6)";
            let arrowhead = svgCreate("path", {
                d: 'm0 0v3.804C0 3.999 0 4 .157 3.864L1.764 2.234C2.002 2.002 2.001 2 1.749 1.749L.078.092C0-.001 0 0 0 .108z',
                'stroke-linecap': "round",
                class: RenderingConstants.classes.FACT_VERB_ARROW_CLASS,
                transform: transform
            });
            svgAppend(group, arrowhead);
        }

        svgAppend(visuals, this.createShadowForShape(group));
        svgAppend(visuals, group);
        return visuals;
    }

    _handleHighlighting(element: Fact, attrs: object, role: number): SVGElement {
        let coverBox = svgCreate("rect", attrs);
        let classing = svgClasses(coverBox);

        let highlightMode = element.highlightMode,
            focus = element.highlightFocus,
            classer = "";

        switch (highlightMode) {
            case "connection":
                classer = element.isFilled(role) ? 
                    RenderingConstants.classes.FACT_ROLE_FILLED_CLASS : 
                    RenderingConstants.classes.FACT_ROLE_FREE_CLASS;
                break; 
            case "constraint":
                classer = element.hasValueConstraintOver(role) ?
                    RenderingConstants.classes.FACT_ROLE_FILLED_CLASS : 
                    RenderingConstants.classes.FACT_ROLE_FREE_CLASS;       
                break;
            case "uniqueness":
                let unique:SimpleConstraint = focus as SimpleConstraint;
                classer = unique.isRoleConstrainted(role) ? 
                    RenderingConstants.classes.FACT_ROLE_FILLED_CLASS : 
                    RenderingConstants.classes.FACT_ROLE_FREE_CLASS; 
                break;
        }
        classing.add(classer);
                
        return coverBox;
    }

}