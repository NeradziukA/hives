import { User } from "../types";
import { v4 as uuidv4 } from "uuid";

export function getUser(): User {
  return {
    id: uuidv4(),
    type: "zombi-1",
    coords: {
      // last known coordinates
      lat: 0,
      lon: 0,
    },
  };
}
