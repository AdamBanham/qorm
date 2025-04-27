
export interface vsCodeMesage {
    type: string;
    alert: string;
    message: string;
}

const EXT_STUB = "qORMa Editor\n";

export default class VscodeMessager {
    $inject: any;  
    private vscode: any;

    public constructor() {
        this.vscode = null;
    }

    /**
     * Sets the vscode API instance.
     * @param {any} vscode - The vscode API instance.
     */
    setApi(vscode: any) {
        this.vscode = vscode;
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


}

VscodeMessager.prototype.$inject = [];