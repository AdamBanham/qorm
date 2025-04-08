import { Connection, Element, Label } from "diagram-js/lib/model/Types";
import { getNextIdentifier } from "./util";
import { Point } from "diagram-js/lib/util/Types";

export interface connection extends Connection {
    mandatory: boolean,
    roleExitPoint: Point,
    role: number;
    type: string;
}

export function createConnection(waypoints: Point[], role:number,
    mandatory:boolean=false
){
    return new OrmConnection(waypoints, role, mandatory)
}

export class OrmConnection implements Connection {
    [x: string]: any;
    mandatory: boolean;
    waypoints: Point[];
    id: string;
    roleExitPoint: Point;
    touched:boolean;
    role:number;
    businessObject?: any;
    label?: Label | undefined;
    labels: Label[];
    parent?: Element | undefined;
    incoming: Connection[];
    outgoing: Connection[];
    source?: Element | undefined;
    target?: Element | undefined;
    type: string = "connection";

    constructor(waypoints:Point[], role:number, mandatory:boolean){
        this.x = 0
        this.y = 0
        this.id = "connection-" + getNextIdentifier();
        this.role = role
        if (waypoints.length > 0){
            this.waypoints = waypoints.slice();
        } else {
            this.waypoints = [];
        }
        
        this.mandatory = mandatory;
        this.touched = false;
        this.roleExitPoint = { x:-99, y:-99 };
        this.label = undefined
        this.labels = [];
        this.incoming = []
        this.outgoing = []
        this.source = undefined;
        this.target = undefined;
        this.parent = undefined;
    }


    flipMandatory(){
        this.mandatory = !this.mandatory
    }

    setMandatory(mandatory:boolean){
        this.mandatory = mandatory;
    }

    isExitPointTouched():boolean {
        return this.touched;
    }

    setExitPoint(point:Point){
        if (!this.touched){
            this.touched = true;
        }
        this.roleExitPoint = point;
    }
}