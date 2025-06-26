import { Position } from "../model/position";
import { CanvasViewbox } from "diagram-js/lib/core/Canvas";
import { ShapeLike } from "diagram-js/lib/model/Types";
import Canvas from "diagram-js/lib/core/Canvas";

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

/**
 * Checks whether the position is within the shape.
 * @param shape the shape to be checked
 * @param position the position to be checked
 * @returns {boolean} whether the position is within the shape
 */
export function isWithinShape(
    shape: ShapeLike,
    position: Position
    ) : boolean {
        let ret = (
            position.x >= shape.x &&
            position.x <= shape.x + shape.width &&
            position.y >= shape.y &&
            position.y <= shape.y + shape.height
        );
        return ret;
    };

/**
 * Applies a scale to the canvas to fit the elements within 
 * the viewport.
 * @param {Canvas} canvas the canvas to be scaled
 */
export function scaleToFitElements(canvas:Canvas){
    const {inner,outer} = canvas.viewbox();
    if (inner.width === 0 || inner.height === 0) {
        return;
    }
    var center = {
        x: inner.x + inner.width/2,
        y: inner.y + inner.height/2
    };
    let scale = Math.min( 
        (outer.width / inner.width),
        (outer.height / inner.height)
    ) * 0.8;
    canvas.zoom('fit-viewport', center);
    canvas.zoom(scale);
}