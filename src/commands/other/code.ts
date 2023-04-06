// code.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { Client, Message } from 'whatsapp-web.js'

let command: Command = {
    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },
    nativeText: {
        name: "קוד",
        description: "",
        category: "אחר"
    },
    async execute(client: Client, msg: Message) {
        await msg.reply("https://github.com/martinalebachew/BrenerBot")
    }
}

module.exports = command
