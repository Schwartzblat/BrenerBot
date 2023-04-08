// create.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { WhatsAppConnection } from "../../whatsapp-api/client"
import { MessageBase } from "../../whatsapp-api/message"
import { CanvasRenderingContext2D, createCanvas, registerFont } from 'canvas';

const STICKER_NAME = "BrenerBot"
const STICKER_AUTHOR = "@martinalebachew on GitHub"

const IMAGE_SIZE_PX = 800
const IMAGE_PADDING_PX = 160

const IMAGE_MIME_TYPE = "image/png"
const STICKER_BG_COLORS = ['#63AF6F', '#6398AF', '#8463AF', '#AF6395', '#ADAF63']

const TESTING_FONT_SIZE = 20
const LINE_HEIGHT_MULTIPLIER = 0.92

class Line {
    content: string
    lengthPx: number

    constructor(_content: string, _length: number) {
        this.content = _content
        this.lengthPx = _length
    }
}

function longestLineCallback(prev: Line, curr: Line) {
    return prev.lengthPx < curr.lengthPx ? curr : prev
}

function splitIntoLines(words: string[], breakFactor: number, ctx: CanvasRenderingContext2D) {
    if (!breakFactor) {  // Handle zero breakFactor by returning one line
        let lineText = words.join(" ")
        return [new Line(lineText, ctx.measureText(lineText).width)]
    }

    let lines = []
    for (let i = 0; i < words.length; i += breakFactor) {
        let lineText = words.slice(i, i + breakFactor).join(" ")
        lines.push(new Line(lineText, ctx.measureText(lineText).width))
    }

    return lines
}

function splitLinesIntoSquare(text: string, ctx: CanvasRenderingContext2D) {
    let breakFactor = 0  // Defines at which frequency line breaks should be added
    let words = text.split(" ")
    let lines: Line[]

    let longestLine: Line
    let squareHeight: number, squareWidth: number
    let squareDiff = Number.MAX_VALUE, squarePrevDiff: number

    do {
        lines = splitIntoLines(words, breakFactor, ctx)

        longestLine = lines.reduce(longestLineCallback)
        squareWidth = longestLine.lengthPx
        squareHeight = lines.length * (TESTING_FONT_SIZE * LINE_HEIGHT_MULTIPLIER)

        squarePrevDiff = squareDiff
        squareDiff = Math.abs(squareHeight - squareWidth)
        breakFactor++
    } while (breakFactor < words.length && squareDiff < squarePrevDiff)

    lines = splitIntoLines(words, --breakFactor, ctx)
    return lines
    // Note: longestLine, squareWidth, squareHeight, squareDiff, squarePrevDiff are now OUTDATED
}

function textToImageBuffer(text: string) {
    text = text.replace(/\n+/g, " ")  // Strip line breaks

    // Set up font and canvas
    registerFont("fonts/Assistant/Bold.ttf", { family: "StickerFont" })
    const canvas = createCanvas(IMAGE_SIZE_PX, IMAGE_SIZE_PX)
    const ctx = canvas.getContext('2d')

    // Set up background color
    ctx.fillStyle = STICKER_BG_COLORS[~~(Math.random() * STICKER_BG_COLORS.length)]
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${TESTING_FONT_SIZE}px StickerFont`

    // Split text into lines
    let lines = splitLinesIntoSquare(text, ctx)
    let longestLine = lines.reduce(longestLineCallback)

    // Find maximum font size for the longest line
    // Account for padding, vertically and horizontally
    let fontSize = 1;
    let textWidth, textHeight

    do {
        textWidth = ctx.measureText(longestLine.content).width
        textHeight = (LINE_HEIGHT_MULTIPLIER * fontSize) * lines.length

        fontSize++;
        ctx.font = `${fontSize}px StickerFont`;
    } while (textWidth <= IMAGE_SIZE_PX - IMAGE_PADDING_PX && textHeight <= IMAGE_SIZE_PX - IMAGE_PADDING_PX)

    // Insert text into image center
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const x = canvas.width / 2
    const y = (canvas.height - (lines.length - 1) * (fontSize * LINE_HEIGHT_MULTIPLIER)) / 2
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i].content, x, y + i * (fontSize * LINE_HEIGHT_MULTIPLIER))
    }

    // Return base64 image
    return canvas.toBuffer(IMAGE_MIME_TYPE)
}

let command: Command = {
    requestTypes: ["conversation"],
    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },

    nativeText: {
        name: "סטיקר",
        description: ""
    },

    async execute(whatsapp: WhatsAppConnection, message: MessageBase, type: string, args: string[]) {
        // if (args.length && type == MessageTypes.TEXT) {
        //     media = new MessageMedia(IMAGE_MIME_TYPE, textToImageBase64(args.join(" ")))
        // } else if (!args.length && (message.type == MessageTypes.IMAGE || message.type == MessageTypes.VIDEO)) {
        //     media = await message.downloadMedia()
        // } else return

        await whatsapp.stickerReply(message, textToImageBuffer(args.join(" ")))
        // TODO: change name and author
    }
}

module.exports = command
