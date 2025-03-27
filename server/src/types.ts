export enum MessageType {
  INIT_UNITS = "INIT_UNITS",
  UNIT_AUTHENTICATED = "UNIT_AUTHENTICATED",
  UNIT_CONNECTED = "UNIT_CONNECTED",
  UNIT_DISCONNECTED = "UNIT_DISCONNECTED",
  UNIT_GET_ALL = "UNIT_GET_ALL",
  UNIT_MOVED = "UNIT_MOVED",
}

export type User = {
  id: string;
  type: string;
  coords: Coordinates;
};

export type UserList = { [key: string]: User };

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
  };
};
