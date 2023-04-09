// code.ts
// (C) Martin Alebachew, 2023

import { Command, GroupChatPermissions, PrivateChatPermissions } from '../commands';
import { WhatsAppConnection } from '../../whatsapp-api/client';
import { MessageBase } from '../../whatsapp-api/message';

const command: Command = {
    requestTypes: ['conversation'],

    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Everyone
    },

    nativeText: {
        name: 'קוד',
        description: ''
    },

    async execute(whatsapp: WhatsAppConnection, message: MessageBase, type:string, args: string[]) {
        if (args.length) return;
        await whatsapp.reply(message, 'https://github.com/martinalebachew/BrenerBot');
    }
};

module.exports = command;
