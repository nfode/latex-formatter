"use strict"

import * as vscode from "vscode"
import cp = require("child_process")
import path = require("path")
import os = require("os")

const LATEX_MODE: vscode.DocumentFilter = { language: "latex", scheme: "file" }
let channel: vscode.OutputChannel = null
const formatter: string = "latexindent"
export class OperatingSystem {
    public name
    public file_ext
    public checker
    constructor(name: string, file_ext: string, checker: string) {
        this.name = name
        this.file_ext = file_ext
        this.checker = checker
    }
}
let operatingSystems: OperatingSystem[] = []
operatingSystems[0] = new OperatingSystem("win32", ".exe", "where")
operatingSystems[1] = new OperatingSystem("linux", ".pl", "which")
operatingSystems[2] = new OperatingSystem("darwin", ".pl", "which")

export class LaTexFormatter {
    private machine_os: string
    private current_os: OperatingSystem
    private formatter: string
    constructor() {
        this.machine_os = os.platform()
        console.log(this.machine_os)
    }
    public formatDocument(document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            let filename = document.fileName
            this.current_os = operatingSystems.filter(item => item.name == this.machine_os)[0]
            if(this.current_os == null) return reject("Unsupported operating system.")

            this.checkPath(this.current_os.checker)
                .then(res => {
                    if (!res) {
                        showErrorMessage("Can not find the latexindent executable in PATH!")
                        reject()
                    }
                    return this.format(filename, document)
                })
                .then(
                    res => {
                        return resolve(res)
                    },
                    err => {
                        console.log(err)
                        return reject(err)
                    }
                )
        })
    }
    private checkPath(checker: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            cp.exec(checker + " " + formatter, (err, stdout, stderr) => {
                if (stdout == "") {
                    this.formatter += this.current_os.file_ext
                    this.checkPath(checker).then(res => {
                        if (res) resolve(true)
                        else resolve(false)
                    })
                }
                resolve(true)
            })
        })
    }
    private format(filename: string, document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
        return new Promise((resolve, reject) => {
            cp.exec(formatter + ' "' + filename + '"', (err, stdout, stderr) => {
                if (stdout != "") {
                    const documentStart = new vscode.Position(0, 0)
                    const documentEnd = document.lineAt(document.lineCount - 1).range.end
                    let edit = [
                        new vscode.TextEdit(new vscode.Range(documentStart, documentEnd), stdout)
                    ]
                    return resolve(edit)
                } else {
                    return reject(stderr)
                }
            })
        })
    }
}

function showErrorMessage(msg: string) {
    vscode.window.showErrorMessage(msg)
}

class LaTexDocumentRangeFormatter implements vscode.DocumentFormattingEditProvider {
    private formatter: LaTexFormatter

    constructor() {
        this.formatter = new LaTexFormatter()
    }
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Thenable<vscode.TextEdit[]> {
        return this.formatter.formatDocument(document).then(null, err => {
            showErrorMessage("latex-formatter: An error occurred please check the output.")
            channel.append(err)
            channel.appendLine("")
            channel.show()
            return []
        })
    }
}

export function activate(context: vscode.ExtensionContext) {
    channel = vscode.window.createOutputChannel("latex-formatter")

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            LATEX_MODE,
            new LaTexDocumentRangeFormatter()
        )
    )
}

// this method is called when your extension is deactivated
export function deactivate() {}
