// multi-storage-auth-state.ts
// (C) Martin Alebachew, 2023
// Based on https://github.com/adiwajshing/Baileys/blob/9c28dde04d5f9e797e5d31a48912f2044b2f07ac/src/Utils/use-multi-file-auth-state.ts

import { mkdir, readFile, stat, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { proto, initAuthCreds, BufferJSON, AuthenticationCreds, AuthenticationState, SignalDataTypeMap } from "@adiwajshing/baileys"
import { Client } from "../mongodb-api/client"

export function stringifier(data: any) {
    return JSON.stringify(data, BufferJSON.replacer)
}

export function serializer(data: string) {
    return JSON.parse(data, BufferJSON.reviver)
}

export const multiStorageAuthState = async(folder: string, client: Client): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
    const writeData = (data: any, file: string) => {
        const flatFilename = fixFileName(file)!
        const deadBuffer = stringifier(data)

        client.update(flatFilename, deadBuffer)
        return writeFile(join(folder, flatFilename), deadBuffer)
    }

    const readData = async(file: string) => {
        try {
            const data = await readFile(join(folder, fixFileName(file)!), { encoding: 'utf-8' })
            return serializer(data)
        } catch(error) {
            return null
        }
    }

    const removeData = async (file: string) => {
        const flatFilename = fixFileName(file)!
        client.remove(flatFilename)

        try {
            unlink(join(folder, flatFilename))
        } catch{

        }
    }

    const folderInfo = await stat(folder).catch(() => { })
    if(folderInfo) {
        if(!folderInfo.isDirectory()) {
            throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`)
        }
    } else {
        await mkdir(folder, { recursive: true })
    }

    const fixFileName = (file?: string) => file?.replace(/\//g, '__')?.replace(/:/g, '-')

    const creds: AuthenticationCreds = await readData('creds.json') || initAuthCreds()

    return {
        state: {
            creds,
            keys: {
                get: async(type, ids) => {
                    const data: { [_: string]: SignalDataTypeMap[typeof type] } = { }
                    await Promise.all(
                        ids.map(
                            async id => {
                                let value = await readData(`${type}-${id}.json`)
                                if(type === 'app-state-sync-key' && value) {
                                    value = proto.Message.AppStateSyncKeyData.fromObject(value)
                                }

                                data[id] = value
                            }
                        )
                    )

                    return data
                },

                set: async(data) => {
                    const tasks: Promise<void>[] = []
                    for(const category in data) {
                        // @ts-ignore
                        for(const id in data[category]) {
                            // @ts-ignore
                            const value = data[category][id]
                            const file = `${category}-${id}.json`
                            tasks.push(value ? writeData(value, file) : removeData(file))
                        }
                    }

                    await Promise.all(tasks)
                }
            }
        },

        saveCreds: () => {
            return writeData(creds, 'creds.json')
        }
    }
}