// client.ts
// (C) Martin Alebachew, 2023

import makeWASocket, { WAMessage, MessageUpsertType, ConnectionState, DisconnectReason } from "@adiwajshing/baileys"
import { Boom } from '@hapi/boom'
import { WAConnectionState } from "@adiwajshing/baileys/lib/Types/State";
import { GroupAddress, UserAddress } from "./address"
import { MessageBase, TextMessage } from "./message"
import { Client } from "../mongodb-api/client"
import { multiStorageAuthState } from "./multi-storage-auth-state"
let pino = require("pino")

export class WhatsAppConnection {
    private _conn: any

    async authenticate(client: Client) {
        await client.downloadAll(".wweb_auth")
        await this.authenticateImpl(client)
    }

    async authenticateImpl(client: Client) {
        const { state, saveCreds } = await multiStorageAuthState(".wweb_auth", client)

        this._conn = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: "silent" })
        })

        this._conn.ev.on("creds.update", saveCreds)

        this._conn.ev.on("connection.update", ({ connection, lastDisconnect }: { connection: WAConnectionState, lastDisconnect: ConnectionState["lastDisconnect"] }) => {
            switch (connection) {
                case "close":
                    console.log("🔴 Connection failed:", lastDisconnect?.error ?? "Unknown error")
                const loggedOut = (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut
                    console.log(loggedOut ? "Not attempting to reconnect." : "Attempting to reconnect...")
                    if (!loggedOut) this.authenticateImpl(client)
                    break

                case "connecting":
                    console.log('🟡 Connecting...')
                    break

                case "open":
                    console.log('🟢 Connected!')
                    break
            }
        })
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
