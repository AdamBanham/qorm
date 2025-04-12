import DirectEditing from 'diagram-js-direct-editing/lib/DirectEditing';

export default class OrmLabelEditor extends DirectEditing {
    constructor(eventBus, canvas, textRenderer, directEditing) {
        super(eventBus, canvas, textRenderer, directEditing);
        this._context = {
        touchingType: null,
        touchingMode: null,
        };
    }
    
    complete(){
        var active = this._active;

        if (!active) {
            return;
        }

        var containerBounds,
            previousBounds = active.context.bounds,
            newBounds = this.$textbox.getBoundingClientRect(),
            newText = this.getValue(),
            previousText = active.context.text;


            containerBounds = this._textbox.container.getBoundingClientRect();

            active.provider.update(active.element, newText, active.context.text, {
            x: newBounds.left - containerBounds.left,
            y: newBounds.top - containerBounds.top,
            width: newBounds.width,
            height: newBounds.height
            });

        this._fire('complete');

        this.close();
    }
}