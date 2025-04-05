
/**
 * This module is responsible for managing constraints in the editor.
 * @module constraints
 */
export default class ContraintsModule {

    constructor(eventBus, modeling, dragging) {
        this._dragging = dragging;
        this._eventBus = eventBus;
        this._modeling = modeling;
        this.active = false;

        // register event listeners
        this._eventBus.on('fact.create.constraint', (event) => {
            this.init(event);
        });
    }

    /**
     * 
     */
    init(event) {
        console.log('init constraints');
    }

    /**
     * 
     */
    onMove(event) {
        console.log('onMove constraints');
    }

    
    /**
     * 
     */
    onClick(event) {
        console.log('onClick constraints');
    }

    
    /**
     * 
     */
    onPrimeClick(event) {
        console.log('onPrimeClick constraints');
    }

    
    /**
     * 
     */
    onSecondaryClick(event) {
        console.log('onSecondaryClick constraints');
    }

    
    /**
     * 
     */
    closure(event) {
        console.log('closure constraints');
    }

    
}

ContraintsModule.$inject = [
    'eventBus',
    'modeling',
    'dragging',
];