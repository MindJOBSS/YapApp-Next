import { z as zod } from "zod";

export const messageValidator = zod.object({
  id: zod.string(),
  senderId: zod.string(),
  text: zod.string(),
  timestamp: zod.number(),
});

export const messageArrayValidator = zod.array(messageValidator);

export type Message = zod.infer<typeof messageValidator>;
