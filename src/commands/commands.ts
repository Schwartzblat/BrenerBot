// commands.ts
// (C) Martin Alebachew, 2023

import { Client, Message } from 'whatsapp-web.js'

export enum GroupChatPermissions {
    Nobody, Owner, Admin, Everyone
}

export enum PrivateChatPermissions {
    Nobody, Owner, Everyone
}

export interface Command {
    permissions: {
        groupChat: GroupChatPermissions,
        privateChat: PrivateChatPermissions
    },
    
    // Text attributes in native language
    nativeText: {  
        name: string,
        description: string,
        category: string
    },
    
    execute: (client: Client, msg: Message) => Promise<void>
}