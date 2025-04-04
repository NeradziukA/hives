export enum MessageType {
  INIT_UNITS = "INIT_UNITS",
  UNIT_AUTHENTICATED = "UNIT_AUTHENTICATED",
  UNIT_CONNECTED = "UNIT_CONNECTED",
  UNIT_DISCONNECTED = "UNIT_DISCONNECTED",
  UNIT_GET_ALL = "UNIT_GET_ALL",
  UNIT_MOVED = "UNIT_MOVED",
}

export enum ObjectType {
  ZOMBI_A = "zombi-a",
  BUILDING_A = "builbing-a",
}

export type User = {
  id: string;
  type: ObjectType;
  coords: Coordinates;
};

export type UserList = { [key: string]: User };

export type StaticObject = {
  id: string;
  type: ObjectType;
  coords: Coordinates;
};

export type Coordinates = {
  lat: number;
  lon: number;
};

export type SocketMessage = {
  type: MessageType;
  srcId: string;
  payload?: {
    coords?: Coordinates;
    users?: UserList;
    staticObjects?: StaticObject[];
  };
};
