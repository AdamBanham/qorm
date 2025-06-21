import ContextPad from 'diagram-js/lib/features/context-pad/ContextPad';
import Canvas from 'diagram-js/lib/core/Canvas';
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import EventBus from 'diagram-js/lib/core/EventBus';
import Scheduler from 'diagram-js/lib/features/scheduler/Scheduler';

import { isValueConstraint } from '../constraints/model/utils';

var CONTEXT_PAD_MARGIN = 8;

export default class OrmContextPad extends ContextPad {

    constructor(
        canvas:Canvas, elementRegistry:ElementRegistry,
        eventBus:EventBus, scheduler:Scheduler) {
        super(canvas, elementRegistry, eventBus, scheduler);
    }

    _getPosition(target:any) : any {
        let that = this as any;
        if (isValueConstraint(target)) {
            var container = that._canvas.getContainer();

            var containerBounds = container.getBoundingClientRect();
            let gfx = that._canvas.getGraphics(target);
            let hitBox = gfx.children[2].getBoundingClientRect();

            return {
                left: hitBox.right - containerBounds.left + CONTEXT_PAD_MARGIN * that._canvas.zoom(),
                top: hitBox.top - containerBounds.top
            };
        } else {
            return super._getPosition(target);
        }
    }
}