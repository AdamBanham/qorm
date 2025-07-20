import EventBus from "diagram-js/lib/core/EventBus"
import VscodeMessager from "../vscode/messager"
import ElementRegistry from "diagram-js/lib/core/ElementRegistry"

import { OrmEditorSymbolElement } from "../../../ormEditor"
import { isEntity, isFact, isObjectification, isExactlyValue } from "../model/util"
import { isExternalConstraint } from "../constraints/model/utils"
import Selection from "diagram-js/lib/features/selection/Selection"
import { centerOnElement } from "../utils/canvasUtils"

export type PREFIX = 'symbol.search'
export type SUFFIX = '.start'
export type EVENTS = `${PREFIX}${SUFFIX}`


/**
 * Handles symbol searching functionality in the editor.
 * 
 * Listens to:
 * - `symbol.search.start`: Initiates a symbol search.
 * - `vscode.search.selected`: Handles the selection of a symbol from the search results.
 *    - Ideally, this event should be emitted from the top level webview rather than from the editor.
 * Emits:
 * - `symbol.search.show`: Requests the editor to display the symbol search results.
 */
export default class SymbolSearching {

    static $inject = [ 'eventBus', 'vscodeMessager', 'elementRegistry', 
        'selection', 'canvas' ]

    _bus:EventBus
    _messager:VscodeMessager
    _registry:ElementRegistry
    _selection:Selection
    _canvas: any;

    _editor: HTMLElement | null = null;
    _nextFocusable: HTMLElement | null = null;

    constructor(eventBus:EventBus, vscodeMessager:VscodeMessager, elementRegistry:ElementRegistry
        , selection:Selection, canvas: any
    ) {
        this._bus = eventBus;
        this._messager = vscodeMessager;
        this._registry = elementRegistry;
        this._selection = selection;
        this._canvas = canvas;

        this._bus.on('symbol.search.start', this.start.bind(this));
        this._bus.on('vscode.search.selected', this.selected.bind(this));
    }

    /**
     * Shortuct to fire events related to symbol searching.
     * @param event 
     * @param data 
     */
    fire(event:EVENTS, data?:any) {
        this._bus.fire(event, data);
    }

    include(element:any) : boolean {
        // Check if the element is a valid symbol for searching
        return isEntity(element) || isFact(element) || isObjectification(element) || isExternalConstraint(element);
    }

    /**
     * 
     * @param element 
     * @returns 
     */
    _makeElement(element:any): OrmEditorSymbolElement {
        let option = {
            display: 'missing',
            id: 'missing'
         };

        // handle display 
        if (isEntity(element)) {
            if (isExactlyValue(element)) {
                option.display = `(value) ${element.name}`
            } else {
                option.display = `${element.name} (${element.ref})`
            }
        } else if (isFact(element)) {
            if (element.label) {
                option.display = `(#${element.roles}) ${(element.label as any)}`;
            } else {
                option.display = `(#${element.roles}) ...`
            }
        } else if (isObjectification(element)) {
            let labelName = (element.fact.label as any) || element.fact.id
            option.display = `${element.fact.objectifiedName} (${labelName})` || element.id;
        } else if (isExternalConstraint(element)) {
            option.display = `{${element.description}}` || 'External Constraint';
        }

        option.id = element.id
        return option;
    }

    /**
     * Makes the possible options to symbol search on in the active editor.
     * @returns Array of symbol search options.
     */
    _makeOptions() : Array<OrmEditorSymbolElement> {
        let options:Array<OrmEditorSymbolElement> = [];

        options.push(
            ...this._registry.getAll()
                .filter(this.include.bind(this))
                .map(this._makeElement.bind(this))
        );

        return options;
    }

    start() {
        let message = {
            type: 'symbol.search.show',
            search : {
                options: this._makeOptions(),
                selected: null
            }
        }

        this._messager.sendMessage(message);
    }

    selected(context:any) {
        let selected = context.selected;
        if (selected){
            let id = context.selected.id;
            let shape = this._registry.get(id);
            this._selection.select(
                shape
            );
            centerOnElement(this._canvas, shape);
        } 

        if (this._editor) {
            this._editor.focus();
        } else {
            this._editor = document.getElementById('editor');
            this._editor?.focus()
        }

        if (!this._nextFocusable && this._editor) {
            
            const focusable = Array.from(document.querySelectorAll<HTMLElement>(
                'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            )).filter(el => !el.hasAttribute('disabled') && el.tabIndex >= 0);

            // Find the index of the editor
            const idx = focusable.indexOf(this._editor);

            // Focus the next focusable element, if any
            if (idx !== -1 && idx + 1 < focusable.length) {
                this._nextFocusable = focusable[idx + 1];
            }      
        } 
        this._nextFocusable?.focus();

    }
}