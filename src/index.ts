// index.ts
// (C) Martin Alebachew, 2023

import { join, basename } from 'path';
import { Command, GroupChatPermissions, PrivateChatPermissions } from './commands/commands';
import { dirToCategories } from './commands/categories';
import { log } from './utils/log';
import { WhatsAppConnection } from './whatsapp-api/client';
import { MessageBase, TextMessage } from './whatsapp-api/message';
import { UserAddress} from './whatsapp-api/address';
import { parsePhoneNumber } from 'libphonenumber-js';
import { GroupParticipant } from '@adiwajshing/baileys';
import { Client } from './mongodb-api/client';
import { existsSync, readdirSync, statSync } from 'fs';
import { createServer } from 'http';

// Phase 0: Load configuration file
export let config: any;
if (existsSync(join(__dirname,'../config.json'))) {
    log('Loading configuration from config.json...');
    config  = require('../config.json');
} else log('Loading configuration from environment variables...');

const BOT_PREFIX = config?.botPrefix || process.env.BOT_PREFIX;  // Prefix for all bot commands
const phoneNumber = parsePhoneNumber(config?.phoneNumber || process.env.PHONE_NUMBER, config?.countryCode || process.env.COUNTRY_CODE);
const OWNER_ADDRESS = new UserAddress(phoneNumber.countryCallingCode + phoneNumber.nationalNumber);  // Bot owner's address


// Phase 0: Dispatch HTTP listener
createServer(function (req, res) {
    res.writeHead(200);  // OK response code
    res.end();
}).listen(process.env.PORT);


// Phase 1: Load commands
// Load command files and extract commands
log('Loading command files...');

export const commandsDict: { [key: string]: Command } = { };
export const commandsByCategories: { [key: string]: Command[] } = { };
function scanForCommandFiles(fullDir: string) {
    for (const filename of readdirSync(fullDir)) {
        // For every file and directory under the commands directory:
        if (filename.endsWith('commands.js') || filename.endsWith('categories.js')) {
            return;
        }// Both files are NOT commands
        const file = fullDir + '/' + filename;  // Get full path
        if (statSync(file).isDirectory())
            scanForCommandFiles(file);
            // TODO: limit to one level only
        else {
            const command = require(file);
            log('* Loaded ' + file);
            commandsDict[command.nativeText.name] = command;

            const category = dirToCategories[basename(fullDir)];
            if (!category) throw Error(`No matching category for directory: ${basename(fullDir)}`);
            if (!commandsByCategories[category])
                commandsByCategories[category] = [];
            commandsByCategories[category].push(command);
        }
    }
}
scanForCommandFiles(join(__dirname, 'commands')); // Project's sub-directory for command files
log('Loaded commands.');

// Phase 2: Connect to WhatsApp
const username = config?.mongoDB?.username || process.env.MONGODB_USERNAME;
const password = config?.mongoDB?.password || process.env.MONGODB_PASSWORD;
const endpoint = config?.mongoDB?.endpoint || process.env.MONGODB_ENDPOINT;

const mongodb = new Client(username, password, endpoint);
const whatsapp = new WhatsAppConnection();
whatsapp.authenticate(mongodb).then(() => { whatsapp.setCallback(messageCallback); });

async function messageCallback(message: TextMessage, type: string ) {
    /* Pre-processing: This function is called only on messages
    of a supported type and have been sent while the bot is online. */

    // Processing Stage 1: Obtain command
    const content = message.text;
    if (!content.startsWith(BOT_PREFIX)) return;

    const args = content.substring(BOT_PREFIX.length).split(' ');
    const commandKey = args.shift();
    if (!commandKey) return;

    const commandObj = commandsDict[commandKey];
    if (!commandObj) return;

    // Processing Stage 2: Check message type
    if (!commandObj.requestTypes.includes(type)) return;

    // Processing Stage 3: Verify permissions
    if (!message.inGroup) {  // Private chat
        const senderPerms = (message.author.equals(OWNER_ADDRESS)) ? PrivateChatPermissions.Owner : PrivateChatPermissions.Everyone;
        if (commandObj.permissions.privateChat < senderPerms) return;
    } else {  // Group chat
        let senderPerms;
        if (message.author.equals(OWNER_ADDRESS)) senderPerms = GroupChatPermissions.Owner;
        else senderPerms = GroupChatPermissions.Everyone;
        // else {
        //     let groupMetadata = await whatsapp.fetchGroupMetadata(message.chat)
        //     let participant = groupMetadata.participants.find((participant: GroupParticipant) => {
        //         return participant.id === message.author.serialized
        //     })
        //
        //     let isAdmin = participant.isAdmin || participant.isSuperAdmin
        //     senderPerms = isAdmin ? GroupChatPermissions.Admin : GroupChatPermissions.Everyone
        // }

        if (commandObj.permissions.groupChat < senderPerms) return;
    }

    // Processing Stage 4: Execute command
    log('---> Executing command', commandObj.nativeText.name, 'from', message.author.serialized);
    await commandObj.execute(whatsapp, message, type, args);
}
