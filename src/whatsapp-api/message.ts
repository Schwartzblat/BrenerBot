// message.ts
// (C) Martin Alebachew, 2023

import { GroupAddress, UserAddress } from "./address"

export class MessageBase {
    public author: UserAddress
    public chat: UserAddress | GroupAddress

    constructor(author: UserAddress, chat: UserAddress | GroupAddress) {
        this.author = author
        this.chat = chat
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

export function wrapMessage(message: WAMessage): MessageBase {

}