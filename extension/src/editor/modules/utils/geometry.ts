import { ShapeLike } from "diagram-js/lib/model/Types";

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Line {
    start: Point;
    end: Point;
}

/**
 * @property {Point} vertex - The point of intersection on the rectangle perimeter.
 * @property {number} longside - The length of the longer side of the rectangle that the line intersects.
 * @property {number} angle - The angle in radians at which the line intersects the rectangle.
 */
export interface IntersectionAngle {
    vertex: Point;
    longside: number;
    quadrant: number;
    angle: number;
}

/**
 * checks if a point is inside a rectangle.
 * @param {Point} point the point to check
 * @param {Rect} rect the rectangle to check against
 * @returns {boolean} Returns true if the point is inside the rectangle, otherwise false.
 */
export function checkPointInRect(point: Point, rect: Rect): boolean {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

/**
 * Helper function to convert a shape-like object to a rectangle.
 * @param shape The shape to convert to a rectangle.
 * @returns {Rect} A rectangle representation of the shape.
 */
export function makeRect(shape: ShapeLike): Rect {
    return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
    };
}

/**
 * Works out the intersection point and angle of a line with a rectangle.
 * @param {Point} point A point outside the rectangle.
 * @param {Rect} rect The rectangle to check against
 * @returns {IntersectionAngle | null} The intersection point and angle if the line intersects the rectangle, otherwise null.
 */
export function getAngleIntersection(point: Point, rect: Rect): IntersectionAngle | null {
    let ret = null;
    if (!checkPointInRect(point, rect)) {
        // If the end point is inside the rectangle, we can calculate the angle
        var w = rect.width / 2;
        var h = rect.height / 2;
        var B = {
            x: rect.x + w,
            y: rect.y + h
        };

        // calculate the distance from the point to the center of the rectangle
        var dx = point.x - B.x;
        var dy = point.y - B.y;

        // calculat the intersection angle
        var tan_phi = h / w;
        var tan_theta = Math.abs(dy / dx);

        //tell me in which quadrant the A point is
        var qx = Math.sign(dx);
        var qy = Math.sign(dy);
        var quad;
        if (qx >= 0 && qy <= 0) {
            quad = 0; // Quadrant I
        } else if (qx < 0 && qy <= 0) {
            quad = 1; // Quadrant II
        }
        else if (qx >= 0 && qy > 0) {
            quad = 2; // Quadrant III
        } else {
            quad = 3; // Quadrant IV
        }

        // calculate the intersection point
        let vertex = { x: 0, y: 0 };
        if (tan_theta > tan_phi) {
            vertex.x = B.x + (h / tan_theta) * qx;
            vertex.y = B.y + h * qy;
        } else {
            vertex.x = B.x + w * qx;
            vertex.y = B.y + w * tan_theta * qy;
        }

        // calculate the length of the longer side of the rectangle
        let longside = 0;
        if (tan_theta > 90){
            longside = h;
        } else if (tan_theta <0.01) {
            longside = w;
        } else {
             let s1 = Math.pow(Math.abs(B.x - vertex.x), 2);
            let s2 = Math.pow(Math.abs(B.y - vertex.y), 2);
            longside = Math.sqrt(s1 + s2);
        }
       
       

        ret = {
            vertex: vertex,
            longside: longside,
            angle: tan_theta,
            quadrant: quad
        };
    } else {
        console.warn("getAngleIntersection: Point is inside the rectangle, cannot calculate intersection angle.");
        ret = {
            vertex: point,
            longside: 0,
            angle: 0,
            quadrant: 0
        };
    }
    return ret;
}
