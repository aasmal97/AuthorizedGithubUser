import * as core from "@actions/core";
import { InputZodSchema } from "./types";
import { Octokit } from "@octokit/rest";

async function getMembers(org: string, token: string) {
  const octokit = new Octokit({
    auth: token,
  });
  const membersList = await octokit.orgs.listMembers({
    org,
  });
  const memberData: Promise<{
    login: string;
    role: string;
  }>[] = membersList.data.map(async (member: any) => {
    const membership = await octokit.orgs.getMembershipForUser({
      org,
      username: member.login,
    });
    return {
      login: member.login as string,
      role: membership.data.role as string,
    };
  });
  return Promise.all(memberData);
}
const getInput = () => {
  const results = {
    githubToken: core.getInput("githubToken"),
    githubOrg: core.getInput("githubOrg"),
    actor: core.getInput("actor"),
    authorizedGroups: core.getInput("authorizedGroups"),
    authorizedActors: core.getInput("authorizedActors"),
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
      githubOrg,
      githubToken,
      actor,
      authorizedActors,
      failSilently,
      failureMessage,
      authorizedGroups,
    } = getInput();

    core.debug(`Got actor: ${actor}`);
    core.debug(`Got a list of authorised actors ${authorizedActors}`);
    core.debug(`Got a list of authorised groups ${authorizedGroups}`);
    core.debug(`Got a token ${githubToken}`);
    core.debug(`Got an org ${githubOrg}`);
    const newAuthorizedActors = authorizedActors || [];
    //handle access by organization
    if (authorizedGroups && githubToken && githubOrg) {
      const members = await getMembers(githubOrg, githubToken);
      const users = members
        .filter((m) => authorizedGroups.includes(m.role))
        .map((m) => m.login);
      newAuthorizedActors.push(...users);
    }
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
