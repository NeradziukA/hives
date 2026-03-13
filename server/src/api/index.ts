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
      id: "building-jp2",
      type: ObjectType.BUILDING_A,
      coords: {
        // Aleja Jana Pawła II 3, Gdańsk
        lat: 54.3762,
        lon: 18.6197,
      },
    },
  ];
}
