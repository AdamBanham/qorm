import { Connection, Element, Label } from "diagram-js/lib/model/Types";
import { getNextIdentifier } from "./util";
import { Point } from "diagram-js/lib/util/Types";

const Refs = require('object-refs').Refs;
var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
    labelRefs = new Refs({ name: 'labels', enumerable: true, collection: true }, { name: 'labelTarget' }),
    attacherRefs = new Refs({ name: 'attachers', collection: true }, { name: 'host' }),
    outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
    incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });

export interface connection extends Connection{
    mandatory: boolean,
    lastEdit: Point | null,
    role: number;
    type: string;
}

export function createConnection(role:number,
    mandatory:boolean=false
){
    return new OrmConnection(role, mandatory);
}

export class OrmConnection implements connection {
    mandatory: boolean;
    id: string;
    lastEdit: Point | null;
    touched:boolean;
    role:number;
    businessObject?: any;
    type: string = "connection";
    [x: string]: any;
    waypoints: Point[];
    label?: Label | undefined;
    labels: Label[];
    parent?: Element | undefined;
    incoming: Connection[];
    outgoing: Connection[];
    source?: Element | undefined;
    target?: Element | undefined;

    constructor(role:number, mandatory:boolean){
        // binders
        this.labels = [];
        Object.defineProperty(this, 'label', {
            get: function() {
              return this.labels[0];
            },
            set: function(newLabel) {
        
              var label = this.label,
                  labels = this.labels;
        
              if (!newLabel && label) {
                labels.remove(label);
              } else {
                labels.add(newLabel, 0);
              }
            }
          });
          labelRefs.bind(this, 'labels');
          this.paraent = null;
          parentRefs.bind(this, 'parent');
          this.outgoing = [];
          outgoingRefs.bind(this, 'outgoing');
          this.incoming = [];
          incomingRefs.bind(this, 'incoming');
          outgoingRefs.bind(this, 'source');
          incomingRefs.bind(this, 'target');
          this.waypoints = new Array<Point>();
        // customware
        this.id = "connection-" + getNextIdentifier();
        this.role = role
        this.mandatory = mandatory;
        this.touched = false;
        this.lastEdit = null;
    }
    
    setByAttributes(attributes: any){
        if (attributes.source){
            this.source = attributes.source;
            this.waypoints = this.waypoints.concat([
                {
                    y: attributes.source.y, 
                    x: attributes.source.x
                }
            ]);
        }
        if (attributes.target){
            this.target = attributes.target;
            this.waypoints = this.waypoints.concat([
                {
                    y: attributes.target.y, 
                    x: attributes.target.x
                }
            ]);
        }
        // bendpoints is being a ripe pain
        // so we are going to use waypoints as a workaround
        if (this.waypoints.length < 2){
            this.waypoints = [
                {
                    y: 0, 
                    x: 0
                },
                {
                    y: 0, 
                    x: 0
                }
            ];
        }

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

    buildAttributes(): Map<string, any> {
        const attributes = new Map<string, any>();
        attributes.set("mandatory", this.mandatory);
        attributes.set("role", this.role);
        attributes.set("lastEdit", this.lastEdit);
        attributes.set("waypoints", this.waypoints.map((i) => {
            return {x: Math.fround(i.x), y: Math.fround(i.y)};
        }));
        attributes.set("id", this.id);
        attributes.set("source", this.source ? this.source.id : null);
        attributes.set("target", this.target ? this.target.id : null);
        attributes.set("type", "connection");
        return attributes;
    }
}