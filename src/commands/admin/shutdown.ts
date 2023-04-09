// shutdown.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from '../commands';
import { WhatsAppConnection } from '../../whatsapp-api/client';
import { MessageBase } from '../../whatsapp-api/message';

const NATIVE_SHUTDOWN_MESSAGE = 'להתראות 👋';

const command: Command = {
    requestTypes: ['conversation'],

    permissions: {
        groupChat: GroupChatPermissions.Owner,
        privateChat: PrivateChatPermissions.Owner
    },

    nativeText: {
        name: 'כיבוי',
        description: 'כיבוי מרחוק של הבוט'
    },

    async execute(whatsapp: WhatsAppConnection, message: MessageBase, type: string, args: string[]) {
        if (args.length) return;
        await whatsapp.reply(message, NATIVE_SHUTDOWN_MESSAGE);
        setTimeout(process.exit, 3000);  // Wait for message to flush
    }
};

module.exports = command;
