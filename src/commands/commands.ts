// commands.ts
// (C) Martin Alebachew, 2023

import { WhatsAppConnection } from '../whatsapp-api/client';
import { MessageBase } from '../whatsapp-api/message';

export enum GroupChatPermissions {
    Nobody, Owner, Admin, Everyone
}

export enum PrivateChatPermissions {
    Nobody, Owner, Everyone
}

export interface Command {
    requestTypes: string[],  // Fallback is text message type
    permissions: {
        groupChat: GroupChatPermissions,
        privateChat: PrivateChatPermissions
    },

    // Text attributes in native language
    nativeText: {
        name: string,
        description: string
    },

    execute: (client: WhatsAppConnection, msg: MessageBase, type: string, args: string[]) => Promise<void>
}
