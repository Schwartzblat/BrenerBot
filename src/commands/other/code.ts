// code.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { WhatsAppConnection } from "../../whatsapp-api/client"
import { MessageBase } from "../../whatsapp-api/message"

let command: Command = {
    requestTypes: ["conversation"],

    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },

    nativeText: {
        name: "קוד",
        description: ""
    },

    async execute(client: WhatsAppConnection, msg: MessageBase, args: string[]) {
        if (args.length) return
        await msg.reply("https://github.com/martinalebachew/BrenerBot")
    }
}

module.exports = command
