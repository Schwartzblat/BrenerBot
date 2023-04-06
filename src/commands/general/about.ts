// about.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { Client, Message } from 'whatsapp-web.js'

let command: Command = {
    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },
    nativeText: {
        name: "אודות",
        description: "מי אני ומה שמי",
        category: "כללי"
    },
    async execute(client: Client, msg: Message) {
        await msg.reply("שלום! אני ברנרבוט 👋")
    }
}

module.exports = command
