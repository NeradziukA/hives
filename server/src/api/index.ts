import { User } from "../types";
import { v4 as uuidv4 } from "uuid";

export function getUser(): User {
  return {
    id: uuidv4(),
    type: "zombi-1",
  };
}
