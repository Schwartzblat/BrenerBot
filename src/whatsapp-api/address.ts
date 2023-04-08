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
}

export class UserAddress extends Address {
    constructor(groupId: number) {
        super(groupId, Server.User);
    }
}

export class GroupAddress extends Address {
    constructor(userId: number) {
        super(userId, Server.Group);
    }
}