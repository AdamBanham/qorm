import * as path from 'path';
import * as vscode from 'vscode';
import { OrmEditorProvider } from './ormEditor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(OrmEditorProvider.register(context));

	context.subscriptions.push(
		vscode.commands.registerCommand('qorm3.helloWorld', () => {
			// Create and show a new webview
			const panel = vscode.window.createWebviewPanel(
			  'qorm', // Identifies the type of the webview. Used internally
			  'Testing Hello', // Title of the panel displayed to the user
			  vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			  {} // Webview options. More on these later.
			);
			// And set its HTML content
			panel.webview.html = "<h1> Hello World! </h1>";
		  })
	);
}
  