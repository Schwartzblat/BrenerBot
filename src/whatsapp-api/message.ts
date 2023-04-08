// message.ts
// (C) Martin Alebachew, 2023

import { Address, GroupAddress, UserAddress } from "./address"
import { WAMessage, getContentType, proto } from "@adiwajshing/baileys"

export class MessageBase {
    public author: UserAddress
    public chat: UserAddress | GroupAddress
    public inGroup: boolean

    constructor(author: UserAddress, chat: UserAddress | GroupAddress, inGroup: boolean) {
        this.author = author
        this.chat = chat
        this.inGroup = inGroup
    }

    public static parse(message: WAMessage): { message: MessageBase, type: string } | undefined {
        let chat = Address.parse(message.key?.remoteJid ?? "")
        let inGroup = !(chat instanceof UserAddress)
        let author

        if (inGroup) author = Address.parse(message.key?.participant ?? "")
        else author = chat

        let type = getContentType(message.message ?? undefined)

        if (type === "conversation")  // Text message
            return { message: new TextMessage(author, chat, message.message?.conversation ?? "", inGroup), type: type }
        else  // Unsupported message type
            return
    }
}

export class TextMessage extends MessageBase {
    public text: string

    constructor(author: UserAddress, chat: UserAddress | GroupAddress, text: string, inGroup: boolean) {
        super(author, chat, inGroup)
        this.text = text
    }
}

// export interface ImageMessage extends MessageBase {
//     text: string
//     image:
// }
