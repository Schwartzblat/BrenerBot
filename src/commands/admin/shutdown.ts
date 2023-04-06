// shutdown.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { cleanShutdown } from "../../main"
import { Client, Message } from 'whatsapp-web.js'

const NATIVE_SHUTDOWN_MESSAGE = "להתראות 👋"

let command: Command = {
    permissions: {
        groupChat: GroupChatPermissions.Owner,
        privateChat: PrivateChatPermissions.Owner
    },
    nativeText: {
        name: "כיבוי",
        description: "מי אני ומה שמי",
        category: "פקודות מנהל"
    },
    async execute(client: Client, msg: Message, args: string[]) {
        if (args.length) return
        await msg.reply(NATIVE_SHUTDOWN_MESSAGE)
        setTimeout(cleanShutdown, 3000)  // Wait for message to flush
    }
}

module.exports = command