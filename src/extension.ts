'use strict';

import * as vscode from 'vscode';
import cp = require('child_process');
import path = require('path');

const fullRange = doc => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
const LATEX_MODE: vscode.DocumentFilter = { language: 'latex', scheme: 'file' };

export class LaTexFormatter {
    public formatDocument(document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            let filename = document.fileName;
            var edit = null;
            cp.exec('latexindent ' + filename, (err, stdout, stderr) => {
                edit = [vscode.TextEdit.replace(fullRange(document), stdout)];
                return resolve(edit);
            });

        });
    }
}

class LaTexDocumentRangeFormatter implements vscode.DocumentFormattingEditProvider {
    private formatter: LaTexFormatter;

    constructor() {
        this.formatter = new LaTexFormatter();
    }
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions, token: vscode.CancellationToken):
        Thenable<vscode.TextEdit[]> {
        return document.save().then(() => {
            return this.formatter.formatDocument(document);
        });

    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            LATEX_MODE, new LaTexDocumentRangeFormatter()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}