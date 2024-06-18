import { z } from "zod";
export enum GroupValues {
  ADMIN = "admin",
  OWNER = "owner",
  MEMBER = "member",
}
export type Input = {
  actor?: string;
  authorisedActors: string[];
  failSilently?: string;
  failureMessage?: string;
};
export const InputZodSchema = z.object({
  githubOrg: z.string().optional(),
  githubToken: z
    .string()
    .optional()
    .transform((val) => val || process.env.GITHUB_TOKEN),
  actor: z
    .string()
    .optional()
    .transform((val) => val || process.env.GITHUB_ACTOR || ""),
  authorizedGroups: z
    .string()
    .optional()
    .or(z.array(z.nativeEnum(GroupValues)))
    .transform((val) => {
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return parsed;
        } catch (error) {
          return [val];
        }
      }
      return val;
    })
    .refine((val) => {
      if (!val) return val;
      return Array.isArray(val);
    }),
  authorizedActors: z
    .string()
    .optional()
    .or(z.array(z.string()))
    .transform((val) => {
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return parsed;
        } catch (error) {
          return [val];
        }
      }
      return val;
    })
    .refine((val) => {
      if (!val) return val;
      return Array.isArray(val);
    }),
  failSilently: z.boolean().default(false),
  failureMessage: z
    .string()
    .default("Actor is not authorised to trigger this Workflow."),
});
