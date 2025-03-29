import { Position } from "../model/position";
import { CanvasViewbox } from "diagram-js/lib/core/Canvas";

/**
 * Transforms an mouse original event into the canvas coordinates.
 * @param {CanvasViewbox} canvasViewbox the current view from canvas
 * @param {Position} position the position to be transformed
 * @returns {Position} the transformed position
 */
export function transformToViewbox(
    canvasViewbox:CanvasViewbox, 
    position: Position
    ) : Position {
    return {
        x: position.x / canvasViewbox.scale + canvasViewbox.x,
        y: position.y / canvasViewbox.scale + canvasViewbox.y
    };
};