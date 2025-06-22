import { z as zod } from "zod"


export const friendValidator = zod.object({
    email : zod.string().email("it should be a valid email").min(1,"enter a valid email")
})