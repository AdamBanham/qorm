import {
    append as svgAppend,
    attr as svgAttr,
    create as svgCreate,
    clone as svgClone,
    classes as svgClasses
} from 'tiny-svg';

import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import EventBus from 'diagram-js/lib/core/EventBus';
import {
    createLine
} from 'diagram-js/lib/util/RenderUtil';
import Styles from 'diagram-js/lib/draw/Styles';


import { TYPE, ValueConstraint } from "../../../constraints/model/valueConstraint";
import CONSTANTS from "../../constants";
import { isRoleValueConstraint } from '../../../constraints/model/utils';
import { isFact } from '../../../model/util';

export const ALLOWED_TYPES = [
    TYPE
];
const PRIORITY = 2000;
const TEXT_X_OFFSET = 7; // offset for text x position
const TEXT_Y_OFFSET = 12; // offset for text y position
const TEXT_LETTER_WIDTH = 6; // approximate width of a letter in the text

export default class ValueRenderer extends BaseRenderer {

    static $inject: Array<string>;
    _styles: Styles;

    constructor(eventBus:EventBus, styles:Styles) {
        super(eventBus, PRIORITY);
        this._styles = styles;

        var that = this;
        eventBus.on([ 'render.shape' ], PRIORITY, function(evt, context) {

            var element = context.element,
                visuals = context.gfx;

            if (that.canRender(element)) {
                return that.draw(visuals, element);
            } 
            
            return;
        });
    }

    canRender(element:any): boolean {
        return ALLOWED_TYPES.includes(element.type);
    }

    draw(visuals: SVGElement, shape: ValueConstraint) : SVGElement {
        let g = svgCreate('g');
        svgClasses(g).add(CONSTANTS.RENDER_VISUALS_CLASS);

        // draw the constraint box
        let lines = svgCreate('g', {});
        let head = 0;
        let mut = 0;
        let y_curr = 0;
        let textContent = `${shape.description || '...'}`;

        while (head < textContent.length) {
            y_curr += TEXT_Y_OFFSET;
            mut += 1;
            let text = svgCreate('text');
            svgAttr(text, {
                x: TEXT_X_OFFSET,
                y: y_curr - TEXT_Y_OFFSET * 0.25,
                width: shape.width - 4,
                height: shape.height - 4,
                fill: CONSTANTS.CONSTRAINT_TEXT_COLOUR,
                fontSize: '12px',
            });
            let nextStep = head + Math.floor(
                (shape.width - TEXT_X_OFFSET)
                / TEXT_LETTER_WIDTH
            );
            text.textContent = textContent.substring(head, nextStep);
            head += text.textContent.length;
            svgAppend(lines, text);
        }

        let fontSize = Math.max(24, 12 * mut);
        y_curr -= (mut > 1) ? TEXT_Y_OFFSET : 0;
        let leftBang = svgCreate('text',
            {
                x: -TEXT_X_OFFSET * 0.5,
                y: y_curr,
                width: 2,
                height: shape.height,
                fill: CONSTANTS.CONSTRAINT_COLOUR,
                fontSize: `${fontSize}px`,   
            }
        );
        leftBang.textContent = '{';
        
        
        let rightBang = svgCreate('text',
            {
                x: shape.width - TEXT_X_OFFSET * 0.5,
                y: y_curr,
                width: 2,
                height: shape.height,
                fill: CONSTANTS.CONSTRAINT_COLOUR,
                fontSize: `${fontSize}px`,   
            }
        );
        rightBang.textContent = '}';

        // make a line from center-left of constraint to the source
        let source = shape.source,
            x1 = -TEXT_X_OFFSET,
            y1 = y_curr * 0.75,
            x2, y2, segments = [];
        segments.push({x: x1, y: y1});
        if (isRoleValueConstraint(shape) && isFact(source)) {
            let role = shape.factor? shape.factor : 0;
            let center = source.getCenterForRole(role);
            x2 = (center.x - shape.x);
            y2 = (center.y - shape.y);
            
            segments.push({x: x2, y: y2 - source.height});
            segments.push({x: x2, y: y2});
        } else {
            x2 = (source.x - shape.x) + source.width / 2,
            y2 = (source.y - shape.y) + source.height / 2;
            segments.push({x: x2, y: y2});
        }
        let line = createLine(segments);

        let lineStyle = this._styles.style({
            strokeWidth: 3, stroke: CONSTANTS.CONSTRAINT_COLOUR,
            fill: 'none', 
            'stroke-dasharray': '5, 5',
        });
        svgAttr(line, lineStyle);
        svgAppend(g, line);

        svgAppend(g, leftBang);
        svgAppend(g, lines);
        svgAppend(g, rightBang);
        svgAppend(visuals, g);
        return visuals;
    }

};

ValueRenderer.$inject = [
    'eventBus', 'styles'
];