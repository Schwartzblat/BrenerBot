// message.ts
// (C) Martin Alebachew, 2023

import { Address, GroupAddress, UserAddress } from "./address"
import {proto, WAMessage} from "@adiwajshing/baileys"
import ImageMessage = proto.Message.ImageMessage;

export class MessageBase {
    public author: UserAddress
    public chat: UserAddress | GroupAddress

    constructor(author: UserAddress, chat: UserAddress | GroupAddress) {
        this.author = author
        this.chat = chat
    }

    public static parse(message: WAMessage): MessageBase {
        let chat = Address.parse(message.key?.remoteJid ?? "")
        let author

        if (chat instanceof UserAddress) author = chat
        else author = Address.parse(message.key?.participant ?? "")

        // if (message.message?.imageMessage) return new ImageMessage(author, chat, )
        return new TextMessage(author, chat, message.message?.conversation ?? "")
    }
}

export class TextMessage extends MessageBase {
    public text: string

    constructor(author: UserAddress, chat: UserAddress | GroupAddress, text: string) {
        super(author, chat)
        this.text = text
    }
}

// export interface ImageMessage extends MessageBase {
//     text: string
//     image:
// }
