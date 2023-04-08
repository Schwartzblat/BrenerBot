// client.ts
// (C) Martin Alebachew, 2023

import makeWASocket, { WAMessage, MessageUpsertType, useMultiFileAuthState } from "@adiwajshing/baileys"
import { GroupAddress, UserAddress } from "./address"
import { MessageBase, TextMessage } from "./message"
let pino = require("pino")

export class WhatsAppConnection {
    private _conn: any

    async authenticate() {
        const { state, saveCreds } = await useMultiFileAuthState(".wweb_auth")
        this._conn = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: "silent" })
        })

        this._conn.ev.on("creds.update", saveCreds)
    }

    async setCallback(messageCallback: (message: TextMessage, type: string) => Promise<void>) {
        this._conn.ev.on("messages.upsert", ({ messages, type }: { messages: WAMessage[], type: MessageUpsertType }) => {
            if (type === "notify")  // Handle only messages sent while BrenerBot is up
                messages.forEach((rawMessage) => {
                    const parsed = MessageBase.parse(rawMessage)
                    if (parsed?.message) messageCallback(parsed.message as TextMessage, parsed.type)  // Processes only supported message types
                })
        })
    }

    async fetchGroupMetadata(address: GroupAddress) {
        const allGroupsMetadata = await this._conn.groupFetchAllParticipating()
        return allGroupsMetadata[address.serialized]
    }

    async reply(message: MessageBase, text: string) {
        await this._conn.sendMessage(message.chat.serialized, { text: text }, { quoted: message.raw })
    }

    async stickerReply(message: MessageBase, buffer: Buffer) {
        await this._conn.sendMessage(message.chat.serialized, {
            sticker: buffer,
            isAnimated: false
        }, {
            quoted: message.raw
        })
    }
}