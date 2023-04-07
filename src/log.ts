// log.ts
// (C) Martin Alebachew, 2023

import filesystem from "fs"

const LOGS_DIR = "logs"
let logPath: string
let timestamp = new Date().toString()
let formattedTimestamp = timestamp.substring(0, timestamp.indexOf("(") - 1)
formattedTimestamp = formattedTimestamp.replace(/:/g, "-").replace(/\+/g, "-")

function logImpl(...args: any[]) {
    let currentDate = new Date().toLocaleString("en-GB")
    let append = "\n"
    process.stdout.write("\n")

    args.forEach((arg) => {
        let dataStr = arg.toString()
        append += `[${currentDate}] ` + dataStr
        process.stdout.write(dataStr)
    })

    if (!logPath) {
        logPath = `${LOGS_DIR}/${formattedTimestamp}.log`
        saveLog(logPath)
    }

    appendLog(logPath, append)
}

export function log(...args: any[]) {
    logImpl(...args)
}

export function newLine() {
    logImpl()
}

function saveLog(path: string) {
    let filesystem = require("fs")
    if (!filesystem.existsSync(LOGS_DIR))
        filesystem.mkdirSync(LOGS_DIR)

    let header = `BrenerBot Log\n${timestamp}\n`
    filesystem.writeFileSync(path, header)
}

function appendLog(path: string, content: string) {
    let filesystem = require("fs")
    filesystem.appendFileSync(path, content)
}