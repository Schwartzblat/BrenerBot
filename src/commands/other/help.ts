// help.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from '../commands';
import { commandsDict } from '../../index';
import { WhatsAppConnection } from '../../whatsapp-api/client';
import { MessageBase } from '../../whatsapp-api/message';

const NATIVE_HELP_HEADER = '*היי, אני ברנרבוט 👋*\nהנה הפקודות שלי:\n\n';

const command: Command = {
    requestTypes: ['conversation'],

    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },

    nativeText: {
        name: 'עזרה',
        description: ''
    },

    async execute(whatsapp: WhatsAppConnection, message: MessageBase, type: string, args: string[]) {
        if (args.length) return;
        let helpMsg = NATIVE_HELP_HEADER;
        for (const commandName in commandsDict) {
            helpMsg += '* !' + commandName + '\n';
        }

        await whatsapp.reply(message, helpMsg);
    }
};

module.exports = command;
