'use strict';

import * as vscode from 'vscode';
import cp = require('child_process');
import path = require('path');
import os = require('os');
var channel = null;

const fullRange = doc => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
const LATEX_MODE: vscode.DocumentFilter = { language: 'latex', scheme: 'file' };

export class OperatingSystem {
    public name;
    public file_ext;
    public checker;
    constructor(name: string, file_ext: string, checker: string) {
        this.name = name;
        this.file_ext = file_ext;
        this.checker = checker;
    }
}
const windows: OperatingSystem = new OperatingSystem('windows', '.exe', 'where');
const linux: OperatingSystem = new OperatingSystem('linux', '.pl', 'which');

export class LaTexFormatter {
    private machine_os: string;
    private current_os: OperatingSystem;
    private formatter: string;
    constructor() {
        this.machine_os = os.platform();
        this.formatter = 'latexindent';
    }
    public formatDocument(document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            let filename = document.fileName;
            if (this.machine_os == windows.name) {
                this.current_os = windows;
            } else if (this.machine_os == linux.name) {
                this.current_os = linux;
            } else {
                showErrorMessage('Your os is not supported!')
            }

            this.checkPath(this.current_os.checker).then((res) => {
                if (!res) {
                    showErrorMessage('Can not find latexindent in PATH!');
                    return resolve(null);
                }
                this.format(filename, document).then((res) => {
                    return resolve(res);
                });
            });
        });
    }
    private checkPath(checker: string): Thenable<boolean> {
        return new Promise((resolve, reject) => {
            cp.exec(checker + ' ' + this.formatter, (err, stdout, stderr) => {
                if (stdout == '') {
                    this.formatter += this.current_os.file_ext;
                    this.checkPath(checker).then((res) => {
                        if (res) resolve(true);
                        else resolve(false);
                    });
                }
                resolve(true);
            });
        })

    }
    private format(filename: string, document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            cp.exec(this.formatter + ' ' + filename, (err, stdout, stderr) => {
                if (stdout != '') {
                    var edit = [vscode.TextEdit.replace(fullRange(document), stdout)];
                    return resolve(edit);
                }
                return resolve(null);
            });
        });

    }
}

function showErrorMessage(msg:string) {
    vscode.window.showErrorMessage(msg);
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
    channel = vscode.window.createOutputChannel('latex-formatter');

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            LATEX_MODE, new LaTexDocumentRangeFormatter()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}