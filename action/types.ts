export enum GroupValues{
  ADMIN = "admin",
  OWNER = 'owner',
  MEMBER = 'member'
}
export type Input = {
  actor?: string;
  authorisedActors: string[];
  failSilently?: string;
  failureMessage?: string;
};

export type InputValues = {
  actor: string;
  authorizedGroups?: GroupValues[]
  authorizedActors?: string[];
  failSilently: boolean;
  failureMessage: string;
};
