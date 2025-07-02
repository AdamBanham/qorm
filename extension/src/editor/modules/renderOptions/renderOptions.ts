
import { OrmEditorSettings, ShapeMapping } from "../../../ormEditor";

import EventBus from "diagram-js/lib/core/EventBus";
/**
 * RenderOptions class for managing rendering options in the ORM editor.
 */
export default class RenderOptions {

    static $inject = ['eventBus', 'modeling'];
    _options:OrmEditorSettings;
    _modeling:any; 

    constructor(eventBus:EventBus, modeling:any) {
        this._options = {
            debugRendering: false,
            renderingOptions: {
                opacity: {
                    shape: 1,
                    others: {
                        fact: 1,
                        entity: 1,
                        label: 1,
                        objectification: 1,
                        uniquenessConstraint: 1,
                        valueConstraint: 1,
                        roleConnection: 1,
                        subtypeConnection: 1
                    }
                },
                debugDot: {
                    shape: false,
                    others: {
                        fact: false,
                        entity: false,
                        label: false,
                        objectification: false,
                        uniquenessConstraint: false,
                        valueConstraint: false,
                        roleConnection: false,
                        subtypeConnection: false
                    }
                }
            }
        };

        this._modeling = modeling;

        eventBus.on('vscode.settings', (event:any) => {
            this._options = event.settings;
            this._modeling.triggerRefresh();
        });

    }

    isDebugging(): boolean {
        return this._options.debugRendering;
    }

    getDebugOpacity(): number {
        if (this.isDebugging()){
            return this._options.renderingOptions.opacity.shape;
        }
        return 1;
    }

    getShapeDebugOpacity(shape:string & keyof ShapeMapping<number>): number {
        if (!this.isDebugging()) {
            return 1;
        }
        if (this._options.renderingOptions.opacity.others[shape] !== undefined) {
            return this._options.renderingOptions.opacity.others[shape];
        }
        console.warn(`Shape ${shape} not found in rendering options for opacity.`);
        return 1;
    }

    computeShapeOpacity(shape:string & keyof ShapeMapping<number>): number {
        let ret = 1 * this.getDebugOpacity();
        ret = ret * this.getShapeDebugOpacity(shape);
        return ret;
    }

    getDebugDot(): boolean {
        return this._options.renderingOptions.debugDot.shape 
            && this.isDebugging();
    }

    getShapeDebugDot(shape:string & keyof ShapeMapping<boolean>): boolean {
        if (!this.isDebugging()) {
            return false;
        }
        if (this.getDebugDot()) {
            return true;
        }
        if (this._options.renderingOptions.debugDot.others[shape] !== undefined) {
            return this._options.renderingOptions.debugDot.others[shape]!;
        }
        console.warn(`Shape ${shape} not found in rendering options for debug dot.`);
        return false;
    }

}