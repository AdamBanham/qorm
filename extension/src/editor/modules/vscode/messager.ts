import EventBus from "diagram-js/lib/core/EventBus";

export interface vsCodeMesage {
    type: string;
    alert?: string;
    message?: string;
    search?: any
}

const EXT_STUB = "qORMa Editor\n";

const busPrefix = "vscode.";

export default class VscodeMessager {
    static $inject: string[] = [ 'eventBus' ];  
    private vscode: any;
    private _eventBus: EventBus;

    public constructor(eventBus: EventBus) {
        this.vscode = null;
        this._eventBus = eventBus;
    }

    /**
     * Sets the vscode API instance.
     * @param {any} vscode - The vscode API instance.
     */
    setApi(vscode: any) {
        this.vscode = vscode;
    }

    capture(type:string, context:any) {
        console.log(`Capturing event: ${busPrefix}${type}`, context);
        this._eventBus.fire(busPrefix + type, context);
    }

    /**
     * Sends a message to the outer vscode instance.
     * @param {vsCodeMesage} message 
     */
    sendMessage(message: vsCodeMesage) {
        if (this.vscode) {
            this.vscode.postMessage(message);
        }
    }

    sendInformationMessage(message: string) {
        this.sendMessage({
            type: "vscode.alert",
            alert: "info",
            message: EXT_STUB + message
        });
    };

    sendErrorMessage(message: string) {
        this.sendMessage({
            type: "vscode.alert",
            alert: "error",
            message: EXT_STUB + message
        });
    };

    sendWarningMessage(message: string) {
        this.sendMessage({
            type: "vscode.alert",
            alert: "warning",
            message: EXT_STUB + message
        });
    };

    sendDocumentSave() {
        this.sendMessage({
            type: "vscode.save",
        });
    }

}