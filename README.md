# BrenerBot 🤖

An easy to use WhatsApp utility bot, written in TypeScript.
Designed mainly for group chats!

> **Warning**
> BrenerBot relies on WhatsApp-Web.js to connect to the WhatsApp API. The connection _should_ be stable and not trigger any bans. However, WhatsApp hates fun, so consider it as a possibility, don't do anything stupid and pay attention to the API limits.

## Features

| Feature                     | Availability |
| :-------------------------- | :----------- |
| Create stickers from text   | 🚧           |
| Create stickers from images | ✅           |
| Create stickers from videos | ✅           |
| Create stickers from GIFs   | ✅           |
| View source code            | ✅           |
| View all commands           | 🚧           |

## Getting started

### Configure Your Bot

Create a config.json file from the config.json.example file:

_config.json_

```
{
    "botPrefix": "!",
    "countryCode": "US",
    "phoneNumber": "2133734253"
}
```

BrenerBot will respond only to messages that start with the `botPrefix`, and exactly follow the command syntax.

`countryCode` and `phoneNumber` are used to specify the owner's phone number. This is a privilleged user and has additional command-running permissions.

`countryCode` should contain the owner's country code as a two-letters string (ISO 3166-1 Alpha-2). [Click here](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) for a complete list.

`phoneNumber` should contain the owner's phone number, without any prefix. This includes a plus sign, a country code or any leading zeros.

### Install Dependencies

BrenerBot requires the following software:

- NodeJS
- ffmpeg

After installing the requirements above and adding them to the PATH environment variable, you can use the following command to install all of the required libraries:

```
npm install
```

### Compile & Run

This project contains three built-in scripts, written for unix and unix-like systems. On other operating systems, mainly windows, you will need to manually edit those scripts and replace OS-specific commands (currently only `rm -r build`).

#### Compile: Recompile TypeScript files into JavaScript

```
npm run compile
```

#### Run: Run BrenerBot

```
npm run run
```

#### Start: Recompile & Run!

```
npm start
```

And that's it!

### Optional: Add Commands!

BrenerBot is build with a high level of modularity in mind. You can add your own commands by creating command files in a sub-directory under 'src/commands' and
conforming with the command structure, as specified in 'src/commands/commands.ts'. Make sure to include this sub-directory in 'src/commands/categories.ts' and define the corresponding category name in native language.

A command file should look like this:

```typescript
import { Command, GroupChatPermissions, PrivateChatPermissions } from "../commands"
import { Client, Message } from 'whatsapp-web.js'

let command: Command = {
    permissions: {
        groupChat: GroupChatPermissions.Everyone,
        privateChat: PrivateChatPermissions.Owner
    },

    nativeText: {
        name: "ping",
        description: "pongs!",
        category: "misc"
    },

    async execute(client: Client, msg: Message, args: string[]) {
        if (args.length) return
        await msg.reply("pong! 🏓")
    }
}

module.exports = command
```

Share your commands with us :)
