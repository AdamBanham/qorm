import InteractionEvents, { Element } from 'diagram-js/lib/features/interaction-events/InteractionEvents';
import EventBus from 'diagram-js/lib/core/EventBus';
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import Styles from 'diagram-js/lib/draw/Styles';
import { isConstraint, isObjectification } from '../model/util';

export default class OrmInteractionEvents extends InteractionEvents {

    constructor(
        eventBus:EventBus, elementRegistry:ElementRegistry, 
        styles:Styles) {
        super(eventBus, elementRegistry, styles);

        this.createDefaultHit = (element: Element, gfx: SVGElement) => {
            var waypoints = element.waypoints,
                isFrame = element.isFrame,
                boxType;

            if (waypoints) {
                return this.createWaypointsHit(gfx, waypoints);
            } else {
                boxType = isFrame ? 'stroke' : 'all';
                let shape = (element as any).shape || element;
                if (isObjectification(shape) || isConstraint(shape)) {
                    boxType = 'no-move';
                }

                return this.createBoxHit(gfx, boxType, {
                    width: element.width,
                    height: element.height
                });
            }
        };
    }
}