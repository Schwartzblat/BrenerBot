// message.ts
// (C) Martin Alebachew, 2023

import { Address, GroupAddress, UserAddress } from "./address"
import { WAMessage, getContentType } from "@adiwajshing/baileys"

export class MessageBase {
    public author: UserAddress
    public chat: UserAddress | GroupAddress
    public inGroup: boolean
    public raw: WAMessage

    constructor(rawMessage: WAMessage, author: UserAddress, chat: UserAddress | GroupAddress, inGroup: boolean) {
        this.author = author
        this.chat = chat
        this.inGroup = inGroup
        this.raw = rawMessage
    }

    public static parse(message: WAMessage): { message: MessageBase, type: string } | undefined {
        let chat = Address.parse(message.key?.remoteJid ?? "")
        if (!chat) return

        let inGroup = !(chat instanceof UserAddress)
        let author

        if (inGroup) {
            author = Address.parse(message.key?.participant ?? "")
            if (!author) return
        } else author = chat

        let type = getContentType(message.message ?? undefined)

        if (type === "conversation")  // Text message
            return { message: new TextMessage(message, author, chat, message.message?.conversation ?? "", inGroup), type: type }
        else  // Unsupported message type
            return
    }
}

export class TextMessage extends MessageBase {
    public text: string

    constructor(rawMessage: WAMessage, author: UserAddress, chat: UserAddress | GroupAddress, text: string, inGroup: boolean) {
        super(rawMessage, author, chat, inGroup)
        this.text = text
    }
}

// export interface ImageMessage extends MessageBase {
//     text: string
//     image:
// }
