
import  {
    isLabel, isConnection
} from "diagram-js/lib/util/ModelUtil"

import {
    findFreePosition,
    generateGetNextPosition,
    getConnectedDistance
} from 'diagram-js/lib/features/auto-place/AutoPlaceUtil.js';

import { unitHeight } from "../model/facts";

import { isFact } from "../model/util";
  

export default function ContextPadProvider(
    create, elementFactory, connect, contextPad, modeling, eventBus, registry
) {
    this._create = create;
    this._elementFactory = elementFactory;
    this._connect = connect;
    this._modeling = modeling;
    this._eventBus = eventBus;
    this._registry = registry
    contextPad.registerProvider(this);
}

    ContextPadProvider.$inject = [
        'create',
        'elementFactory',
        'connect',
        'contextPad',
        'modeling',
        'eventBus',
        'elementRegistry'

    ];

    ContextPadProvider.prototype.getContextPadEntries = function(element){
        
        var connect = this._connect,
            modeling = this._modeling,
            factory = this._elementFactory,
            create = this._create,
            registry = this._registry,
            bus = this._eventBus;

        function removeElement(event, target, autoActivate) {
            bus.fire('pad.delete', {
                elements: [element]
            })
            modeling.removeElements([ element ]);
        }
            
        function startConnect(event, element, autoActivate) {
            connect.start(event, element, autoActivate);
        }

        function createConnectedFact(event, element){
            var fact = Object.assign(
                factory.createDummyAttributesForFacts(),
                { x: element.x+element.width+ 100, y: element.y+element.height/2,}
            );
            fact = modeling.createShape(
                fact, {x: fact.x, y:fact.y}, 
                element.parent
            );

            let connect = modeling.connect(element, fact);
            modeling.moveElements([connect,element,fact], {x:0,y:0});
            bus.fire('elements.changed', {
                elements: [connect,element,fact]}
            )            
        }

        var contextPadOptions = {}

        // alaways present
        contextPadOptions['delete'] = {
            action: {
                click: removeElement,
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'delete',
            group: 'edit'
        }

        // if (isLabel(element)){
        //     return contextPadOptions
        // }

        // if (isFlow(element)){

        //     contextPadOptions['flip'] = {
        //         action: {
        //             click: flipConnection
        //         },
        //         class: 'context-pad-flip',
        //         html: '<div class="entry mdi mdi-arrow-left-right editor-hover"/>',
        //         title: 'flip direction',
        //         group: 'edit'
        //     }

        //     return contextPadOptions
        // }

        // if (isTransition(element)){
        //     contextPadOptions['switch'] = {
        //         action: {
        //             click: switchStateType
        //         },
        //         class: 'context-pad-switch',
        //         html: '<div class="entry mdi mdi-toggle-switch mdi editor-hover"/>',
        //         title: element.silent ? 'make visible' : 'make silent',
        //         group: 'edit'
        //     }

        // }

        // if (isPlace(element)){
        //     contextPadOptions['create-trans'] = {
        //         action: {
        //             click: createConnectedTransition
        //         },
        //         class: 'context-pad-create-trans',
        //         html: '<div class="entry mdi mdi-square-rounded-outline editor-hover"/>',
        //         title: 'add transition',
        //         group: 'add'
        //     }
        //     contextPadOptions['create-sil-trans'] = {
        //         action: {
        //             click: (ev,el) => createConnectedTransition(ev, el, true)
        //         },
        //         class: 'context-pad-create-sil-trans',
        //         html: '<div class="entry mdi mdi-square-rounded editor-hover"/>',
        //         title: 'add silent transition',
        //         group: 'add'
        //     }
        // }

        // if (isTransition(element)){
        //     contextPadOptions['create-place'] = {
        //         action: {
        //             click: createConnectedPlace
        //         },
        //         class: 'context-pad-create-place',
        //         html: '<div class="entry mdi mdi-circle-outline editor-hover"/>',
        //         title: 'add place',
        //         group: 'add'
        //     }
        // }        
        if (isConnection(element)){
            return contextPadOptions;
        }

        contextPadOptions['connect'] = {
            action: {
                click: startConnect,
                dragstart: startConnect
            },
            className: 'context-pad-contect',
            html: '<div class="entry mdi-arrow-right-thick mdi editor-hover"/>',
            title: 'connect',
            group: 'join'
        };

        if (isFact(element)){
            return contextPadOptions;
        }
        
        contextPadOptions['create-fact'] = {
            action: {
                click: (ev,el) => createConnectedFact(ev, el)
            },
            class: 'context-pad-create-fact',
            html: '<div class="entry mdi mdi-alpha-f-box-outline editor-hover"/>',
            title: 'Add and Connect to Fact',
            group: 'add'
        };
    

        return contextPadOptions
    }