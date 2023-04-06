// create.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { Client, Message, MessageMedia, MessageTypes } from 'whatsapp-web.js'
import { createCanvas, registerFont } from 'canvas';
import {join} from "path";

const STICKER_NAME = "BrenerBot"
const STICKER_AUTHOR = "@martinalebachew on GitHub"
const IMAGE_SIZE_PX = 800
const IMAGE_PADDING_PX = 160
const IMAGE_MIME_TYPE = "image/png"

function textToImageB64(text: string) {
    // Set up font and canvas
    registerFont("fonts/Assistant/Bold.ttf", { family: "StickerFont" })
    const canvas = createCanvas(IMAGE_SIZE_PX, IMAGE_SIZE_PX)
    const ctx = canvas.getContext('2d')

    // Set up background color
    ctx.fillStyle = '#63AF6F'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Split every three words into a new line
    let words = text.split(" ")
    let lines: string[] = []

    for (let i = 0; i < words.length; i += 3) {
        let lineText = words.slice(i, i + 3).join(" ")
        lines.push(lineText)
    }

    // Find the longest line
    ctx.font = "20px StickerFont"
    let maxLine = lines[0]
    let width, maxWidth = ctx.measureText(lines[0]).width

    for (let i = 1; i < lines.length; i++) {
        width = ctx.measureText(lines[i]).width

        if (width > maxWidth) {
            maxWidth = width
            maxLine = lines[i]
        }
    }

    // Find maximum font size for the longest line and account for padding
    let fontSize = 1;
    while (ctx.measureText(maxLine).width <= IMAGE_SIZE_PX - IMAGE_PADDING_PX) {
        fontSize++;
        ctx.font = `${fontSize}px StickerFont`;
    }

    // Insert text into image center
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const x = canvas.width / 2
    const y = (canvas.height - (lines.length - 1) * (fontSize * 1.2)) / 2
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * (fontSize * 1.2))
    }

    // Return base64 image
    return canvas.toBuffer(IMAGE_MIME_TYPE).toString("base64")
}

let command: Command = {
    requestTypes: [MessageTypes.IMAGE, MessageTypes.VIDEO, MessageTypes.TEXT],
    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },
    nativeText: {
        name: "סטיקר",
        description: "",
        category: "סטיקרים"
    },
    async execute(client: Client, msg: Message, args: string[]) {
        let media: MessageMedia

        if (args.length && msg.type == MessageTypes.TEXT) {
            media = new MessageMedia(IMAGE_MIME_TYPE, textToImageB64(args.join(" ")))
        } else if (!args.length && (msg.type == MessageTypes.IMAGE || msg.type == MessageTypes.VIDEO)) {
            media = await msg.downloadMedia()
        } else return

        await msg.reply(media, undefined, { sendMediaAsSticker: true, stickerName: STICKER_NAME, stickerAuthor: STICKER_AUTHOR })
    }
}

module.exports = command
