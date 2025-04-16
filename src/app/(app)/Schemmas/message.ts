import { z } from "zod";

export const MessageForm = z.object({
  content: z.string().min(1, {
    message: "message cannot be empty",
  }),
  image: z.any()
});
