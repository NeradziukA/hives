import { ObjectType, StaticObject, User } from "../types";
import { v4 as uuidv4 } from "uuid";

export function getUser(): User {
  return {
    id: uuidv4(),
    type: ObjectType.ZOMBI_A,
    coords: {
      // last known coordinates
      lat: 0,
      lon: 0,
    },
  };
}

export function getStaticObjects(): StaticObject[] {
  return [
    {
      id: uuidv4(),
      type: ObjectType.BUILDING_A,
      coords: {
        // Stokrotka
        lat: 54.3993223,
        lon: 18.5707792,
      },
    },
    {
      id: uuidv4(),
      type: ObjectType.BUILDING_A,
      coords: {
        // Work
        lat: 54.3993223,
        lon: 18.5707792,
      },
    },
  ];
}
