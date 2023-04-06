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
        description: ""
    },
    async execute(client: Client, msg: Message, args: string[]) {
        if (args.length) return
        await msg.reply("https://github.com/martinalebachew/BrenerBot")
    }
}

module.exports = command
