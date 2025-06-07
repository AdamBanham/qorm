import * as vscode from 'vscode';

export class ORMCreate implements vscode.Command {
    public readonly id: string = "qorma";
    public readonly title: string = "qORMa: Create new ORM Diagram";
    public readonly command: string = "Create";

    constructor() {
    }

    public static register(context: vscode.ExtensionContext): void {
        const instance = new ORMCreate();
        context.subscriptions.push(
            vscode.commands.registerCommand(`${instance.id}.${instance.command}`, () => {
            instance.action();
            })
        );
        }

    public action(): void {
        let filename = vscode.window.showInputBox({
            title: "Enter the name for the new ORM diagram",
            prompt: "Filename (without extension)",
        });

        filename.then((filenameInput) => {
            if (filenameInput) {

                // call the vscode commands to create a new file
                // with the name {filenameInput}.orm
                let uri = vscode.Uri.parse(`untitled:${filenameInput}.orm`);

                vscode.workspace.openTextDocument(uri).then((document) => {
                    vscode.commands.executeCommand('vscode.openWith', document.uri, 'qorma.ormEditor');
                    vscode.window.showInformationMessage(
                        `qORMA :: New ORM diagram created: ${filenameInput}.orm`
                    );
                }, (error) => {
                    vscode.window.showErrorMessage(
                        `qORMA :: Error creating file: ${error}`
                    );    
                });

            } else {
                vscode.window.showErrorMessage(
                    "qORMA :: Filename cannot be empty."
                );
            }
        });
    }
}