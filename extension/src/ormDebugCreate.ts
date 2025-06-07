import * as vscode from 'vscode';

export class ORMCreateDebug implements vscode.Command {
    public readonly id: string = "qorma";
    public readonly title: string = "qORMa: (debug) Create new ORM Diagram";
    public readonly command: string = "Create.debug";

    constructor() {
    }

    public static register(context: vscode.ExtensionContext): void {
        const instance = new ORMCreateDebug();
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
                let uri = vscode.Uri.parse(`./${filenameInput}.orm`);

                vscode.workspace.fs.stat(uri).then(() => {
                    // File exists, proceed to open it
                    vscode.workspace.openTextDocument(uri).then((document) => {
                        vscode.commands.executeCommand('vscode.openWith', document.uri, 'qorma.ormEditor');
                        // Check if ViewColumn.Two is already open
                        let second;
                        if (vscode.window.visibleTextEditors.some(editor => editor.viewColumn === vscode.ViewColumn.Two)) {
                            // ViewColumn.Two is already open, just show the document there
                            second = vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
                        } else {
                            // ViewColumn.Two is not open, split editor first
                            vscode.commands.executeCommand('workbench.action.splitEditorRight');
                            second = vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
                        }
                        second.then(() => {
                            setTimeout(() => {
                                vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
                            }, 100);
                        });
                        vscode.window.showInformationMessage(
                            `qORMA :: Reopned existing ORM diagram: ${filenameInput}.orm`
                        );
                    });
                }, () => {
                    // File doesn't exist, create it
                    vscode.workspace.fs.writeFile(uri, new Uint8Array()).then(() => {
                        // File created successfully
                        vscode.workspace.openTextDocument(uri,).then((document) => {
                            vscode.commands.executeCommand('vscode.openWith', document.uri, 'qorma.ormEditor');
                            // Check if ViewColumn.Two is already open
                            let second;
                            if (vscode.window.visibleTextEditors.some(editor => editor.viewColumn === vscode.ViewColumn.Two)) {
                                // ViewColumn.Two is already open, just show the document there
                                second = vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
                            } else {
                                // ViewColumn.Two is not open, split editor first
                                vscode.commands.executeCommand('workbench.action.splitEditorRight');
                                second = vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
                            }
                            second.then(() => {
                                setTimeout(() => {
                                    vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
                                }, 100);
                            });
                            vscode.window.showInformationMessage(
                                `qORMA :: Create New ORM diagram: ${filenameInput}.orm`
                            );
                        });
                    }, (error) => {
                       vscode.window.showErrorMessage(
                        'Error creating file:', error
                    );
                    });
                });
            } else {
                vscode.window.showErrorMessage(
                    "qORMA :: Filename cannot be empty."
                );
            }
        });
    }
}