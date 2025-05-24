var HIGH_PRIORITY = 1100,
    LOW_PRIORITY = 900;

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok';

import { EMIT_NAME as SUBTYPE_EMIT_NAME } from './subtyping';
const DEFAULT_CONNECTORS = [
    'connect',
    SUBTYPE_EMIT_NAME
];

/**
 * Shows connection preview during connect.
 *
 * @param {Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default class OrmConnectPreview {
    constructor(injector, eventBus, canvas, 
        ConnectorNames=DEFAULT_CONNECTORS) {
        this._injector = injector;
        this._eventBus = eventBus;
        this._canvas = canvas;
        
        for (let connector of ConnectorNames){
            this.addListenerFor(connector);
        }
    }

    addListenerFor(connector) {
        var that = this;
        var connectionPreview = this._injector.get('connectionPreview', false);

        connectionPreview && this._eventBus.on(`${connector}.move`, function(event) {
            var context = event.context,
                canConnect = context.canExecute,
                hover = context.hover,
                source = context.source,
                start = context.start,
                startPosition = context.startPosition,
                target = context.target,
                connectionStart = context.connectionStart || startPosition,
                connectionEnd = context.connectionEnd || {
                    x: event.x,
                    y: event.y
                },
                previewStart = connectionStart,
                previewEnd = connectionEnd;

            connectionPreview.drawPreview(context, canConnect, {
                source: source || start,
                target: target || hover,
                connectionStart: previewStart,
                connectionEnd: previewEnd
            });
        });

        this._eventBus.on(`${connector}.hover`, LOW_PRIORITY, function(event) {
            var context = event.context,
                hover = event.hover,
                canExecute = context.canExecute;

            // ignore hover
            if (canExecute === null) {
                return;
            }

            // that._canvas.addMarker(hover, canExecute ? MARKER_OK : MARKER_NOT_OK);
        });

        this._eventBus.on([
            `${connector}.out`,
            `${connector}.cleanup`
        ], HIGH_PRIORITY, function(event) {
            var hover = event.hover;

            // if (hover) {
            //     that._canvas.removeMarker(hover, MARKER_OK);
            //     that._canvas.removeMarker(hover, MARKER_NOT_OK);
            // }
        });

        connectionPreview && this._eventBus.on(`${connector}.cleanup`, function(event) {
            connectionPreview.cleanUp(event.context);
        });
    }
}

OrmConnectPreview.$inject = [
  'injector',
  'eventBus',
  'canvas'
];