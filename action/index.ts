import * as core from "@actions/core";
import { z } from "zod";
import { GroupValues, InputValues } from "./types";
const InputZodSchema = z.object({
  token: z
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
const getInput = (): InputValues => {
  const results = {
    actor: core.getInput("actor"),
    authorizedActors: core.getInput("authorizedActors", { required: true }),
    failSilently: core.getInput("failSilently") === "true" || false,
    failureMessage:
      core.getInput("failureMessage") ||
      "Actor is not authorised to trigger this Workflow.",
  };
  const validationResult = InputZodSchema.safeParse(results);
  if (!validationResult.success) {
    throw new Error(
      `Invalid input: ${JSON.stringify(validationResult.error.format())}`
    );
  }
  return validationResult.data;
};

async function run(): Promise<void> {
  // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
  core.debug(`Starting ...`);

  try {
    core.debug(`Reading input ...`);

    const {
      actor,
      authorizedActors,
      failSilently,
      failureMessage,
      authorizedGroups,
    } = getInput();

    core.debug(`Got actor: ${actor}`);
    core.debug(`Got a list of authorised actors ${authorizedActors}`);
    const newAuthorizedActors = authorizedActors || [];

    const isAuthorisedActor = newAuthorizedActors.includes(actor);
    core.setOutput("isAuthorisedActor", isAuthorisedActor);

    core.debug(`isAuthorisedActor: ${isAuthorisedActor ? "Yes" : "No"}.`);
    core.debug(`Fail silently? ${failSilently ? "Yes" : "No"}!`);

    if (!isAuthorisedActor && !failSilently) {
      core.setFailed(failureMessage);
    }

    if (isAuthorisedActor) {
      core.info(`Actor ${actor} is authorised and can proceed!`);
    }
    core.debug(`Validated actor ...`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }

  core.debug(`Ended ...`);
}

run();
