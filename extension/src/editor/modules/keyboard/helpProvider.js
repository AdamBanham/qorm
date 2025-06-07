export default class HelpProvider {
    toggled = false;

    constructor(eventBus) {
        this.eventBus = eventBus;
        this._help_window = document.getElementById('keyboard-window'); 
        this._keyboard_icon = document.getElementById('keyboard-controls-icon');

        var that = this;
        this._keyboard_icon.addEventListener('click', () => {
            that.eventBus.fire('keyboard.controls.toggle');
        });

        window.addEventListener(
            'click', (event) => {
            if (
                that.toggled &&
                that._help_window &&
                !that._help_window.contains(event.target) &&
                !that._keyboard_icon.contains(event.target)
            ) {
                that.eventBus.fire('keyboard.controls.toggle');
            }
        },);
        
        this.eventBus.on('keyboard.controls.toggle', () => {
            that.showHelp();
        });
    }

    showHelp() {
       if (this.toggled) {
            this._help_window.classList.remove('open');
            this.toggled = false;
        } else {
            this._help_window.classList.add('open');
            this.toggled = true;
        }
    }
}

HelpProvider.$inject = [
    'eventBus',
];