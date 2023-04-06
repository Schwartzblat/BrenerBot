// help.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { commandsDict } from "../../main";
import { Client, Message } from 'whatsapp-web.js'

const NATIVE_HELP_HEADER = "*היי, אני ברנרבוט 👋*\nהנה הפקודות שלי:\n\n"

let command: Command = {
    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },
    nativeText: {
        name: "עזרה",
        description: ""
    },
    async execute(client: Client, msg: Message, args: string[]) {
        if (args.length) return
        let helpMsg = NATIVE_HELP_HEADER
        for (let commandName in commandsDict) {
            helpMsg += "* !" + commandName + "\n"
        }
        
        await msg.reply(helpMsg)
    }
}

module.exports = command
