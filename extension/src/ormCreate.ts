import * as vscode from 'vscode';

const defaultContents = `system:
  name: ''
  type: ORM
  entities: []
  facts: []
  connections: []
`;

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

                let prefix;
                let filename = `${filenameInput.trim()}.orm`;
                let workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0) {
                    prefix = workspaceFolders[0].uri;
                } else {
                    prefix = vscode.Uri.parse('untitled:');
                }
                let uri = vscode.Uri.joinPath(prefix, filename);
                vscode.workspace.openTextDocument(uri).then(
                    (document) => {
                        vscode.commands.executeCommand(
                            'vscode.openWith',
                            document.uri,
                            'qorma.ormEditor'
                        );
                    },
                    (error) => {
                        
                        let edit = new vscode.WorkspaceEdit();
                        edit.createFile(uri, 
                            { 
                                ignoreIfExists: true
                            }
                        );
                        edit.insert(uri, new vscode.Position(0, 0), defaultContents);
                        vscode.workspace.applyEdit(edit).then(
                            () => {
                                    vscode.commands.executeCommand(
                                        'vscode.openWith',
                                        uri,
                                        'qorma.ormEditor'
                                    ).then(
                                        () => {
                                            vscode.window.showInformationMessage(
                                                `qORMA :: Successfully created and opened ${filenameInput}.orm`
                                            );
                                        },
                                        (error) => {
                                            vscode.window.showErrorMessage(
                                                `qORMA :: Error showing newly created file: ${error.message}`
                                            );
                                        }
                                    );
                            }, 
                            (error) => {
                                vscode.window.showErrorMessage(
                                    `qORMA :: Error creating file: ${error.message}`
                                );
                            }
                        );
                        
                    }
                );

            } else {
                vscode.window.showErrorMessage(
                    "qORMA :: Filename cannot be empty."
                );
            }
        });
    }
}