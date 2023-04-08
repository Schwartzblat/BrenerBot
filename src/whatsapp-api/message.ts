// message.ts
// (C) Martin Alebachew, 2023

import { GroupAddress, UserAddress } from "./address"

export interface MessageBase {
    chatId: UserAddress | GroupAddress
    author: UserAddress
    type: string
}

export interface TextMessage extends MessageBase {
    text: string
}

// export interface ImageMessage extends MessageBase {
//     text: string
//     image:
// }