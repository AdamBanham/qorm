import * as vscode from 'vscode';
import  { getNonce } from './util';

export class OrmEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new OrmEditorProvider(context);
        const providerRegistration = 
            vscode.window.registerCustomEditorProvider(
                OrmEditorProvider.viewType,
                 provider
            );
        return providerRegistration;
    }

    private static readonly viewType = 'qorm.ormEditor';
    // private editor:Diagram;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { 
        // this.editor = OrmEditor(context);

    }
    
    /**
     * Entry point for the editor, triggered when a .orm file is opened.
     * @param document 
     * @param webviewPanel 
     * @param token 
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument, 
        webviewPanel: vscode.WebviewPanel, 
        token: vscode.CancellationToken): Promise<void> {
        // Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'connectDiagram.js'));

        const styles = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'editor.css'));

        const djsStyles = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'diagram-js.css'));

        const renderStyles = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'render.css'));

        const mdiStyles = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, "media", "@mdi", "font", "css", "materialdesignicons.css"
        ));
        // Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

        return `<!DOCTYPE>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styles}" rel="stylesheet" />
                <link href="${djsStyles}" rel="stylesheet" />
                <link href="${mdiStyles}" rel="stylesheet" />
                <link href="${renderStyles}" rel="stylesheet" />
                <title>qORM - Editor</title>
            </head>
            <body>
                <div class="content" data-vscode-context='{"webviewSection": "main", "mouseCount": 4, "preventDefaultContextMenuItems": true}'>
                    <h1> Queensland Object-Role-Modelling (ORM) Editor </h1>
                    <div class="editor" id="editor" data-vscode-context='{"webviewSection": "editor"}'></div>
                    <h2> Elementary Facts </h2>
                    <div class="facts" id="facts" data-vscode-context='{"webviewSection": "facts"}'></div>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </div>
            </body>
        </html>
        `;
    } 
    
}