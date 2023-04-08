// address.ts
// (C) Martin Alebachew, 2023

export enum Server {
    User = "@c.us",
    Group = "@g.us"
}

export class Address {
    private _id: string
    private _server: Server
    private _serialized: string

    constructor(id: number, server: Server) {
        this._id = id.toString()
        this._server = server
        this._serialized = this._serialize()
    }

    public set id (id: number) {
        this._id = id.toString()
        this._serialized = this._serialize()
    }

    public set server (server: Server) {
        this._server = server
        this._serialized = this._serialize()
    }

    private _serialize() {
        return this._id + this._server
    }

    public toString() {
        return this._serialized;
    }

    public static parse(serialized: string): Address {
        if (serialized.endsWith(Server.User)) {
            let id = parseInt(serialized.substring(0, serialized.length - Server.User.length))
            return new UserAddress(id)
        } else if (serialized.endsWith(Server.Group)) {
            let id = parseInt(serialized.substring(0, serialized.length - Server.Group.length))
            return new GroupAddress(id)
        } else {
            throw Error("Failed to parse address!")
        }
    }
}

export class UserAddress extends Address {
    constructor(userId: number) {
        super(userId, Server.User);
    }
}

export class GroupAddress extends Address {
    constructor(groupId: number) {
        super(groupId, Server.Group);
    }
}