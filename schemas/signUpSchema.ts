// Zod is a TypeScript-first schema validation library.

import * as z from "zod";

export const signUpSchema = z.object({
    email: z
        .string()
        .min(1, {message: "Email is required"})
        .email({message: "Please enter a valid email"}),
    password: z
        .string() 
        .min(1, {message: "Password is required"})
        .min(8, {message: "password should be minimum of 8 characters"}),
    passwordConfirmation: z
        .string()
        .min(1, {message: "Please confirm your password"}),
})

// in Refine there is a two things as a perameter, the first one is being is the method itself called predicate function and another one is cofiguration...
// predicate function actually gets all the data that is stored inside the object
// and the second one is an object that you have to pass on 
.refine((data) => data.password === data.passwordConfirmation, {
    message: "Password do not match",
    path: ["passwordConfirmation"],
});
