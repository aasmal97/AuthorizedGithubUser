# Authorized Github Actor Github Action

## Introduction

Currently, Github allows repositories to be protected using rulesets, according to an organization member's role, or individual roles. 

However, rulesets for organizations are only enforced on a paid plan, which is not be reasonable for small teams.

In addition Github Actions themselves, responsible for CI/CD pipelines or different automated tasks, sometimes need protection as well.

This action provides potential solutions for these cases. By detecting the Github actor that triggers the workflow, we can progammatically control and protect, branches (with additional steps) or steps in a Github action from only being triggered by certain users.

## Action Usage

### Quickstart

```yaml
name: Authorized Actor
uses: aasmal97/AuthorizedActor@v1.0.0
with:
  authorizedActors:  ${{secrets.AUTHORIZED_ACTORS}}
```

### Inputs:
- ##### githubOrg: `string` (optional)
  
  - GitHub organization name, that you want to use to control acces

- ##### githubToken:`string` (optional)
  
  - GitHub access token with `repo` scop

- ##### actor:`string` (optional)
  
  - Provide the current actor of the workflow. By default it is the value of env.GITHUB_ACTO

- ##### authorizedGroups:`string` (optional)
  
  - Array of groups, i.e owners, admins, etc, managed as a Github Secret to allow only Repository Owners/Admins to change the value

  - NOTE: This is **JSON Stringified List** that consists of any of the following values. 
    `"owner" | "admin" | "member"`

  - To use this option, you MUST also supply a `githubToken` and a `githubOrg` in the action parameters

- ##### authorizedActors:`string` (optional)
  
  - Array of authorised actors, best managed as a GitHub Secret to allow only Repository Owners/Admins to change the values.

  - NOTE: This is **JSON Stringified List** of the Github usernames you want to allow.

- ##### failSilently:`string` (optional)
  
  Whether or not the GitHub action should exit with status code 1 or not

- ##### failureMessage:`string` (optional)
  
  Message to display in the GitHub Action logs when authorised actor check fails


## Limitations

- To protect a branch, you need to write an additional step that if this fails, most recent push or merge request is reverted. This action does not handle this by default, because some users may want to only prevent certain ci/cd pipelines steps instead, and allow the branch to be merged. 

- The `authorizedGroups` and `authorizedActors` must be a string since list inputs are not supported by Github Actions. In the future, this may be changed, when Github supports list inputs natively.

- To use the `authorizedGroups` option, you MUST also supply a `githubToken` and a `githubOrg`. This is a because the organization that the repository belongs to is not immeaditely available in the runner. In addition, the github token supplied in the runner, will not have the organization-level permissions to grab an organization's members and determine their role. As a result, we need a githubToken to read this organization member data, and filter out the users by group, that will have permissions. 

## Contributing

Anyone is welcome to contribute, simply open an issue or pull request. When opening an issue, ensure you can reproduce the issue, and list the steps you took to reproduce it.

### Development Environment

To run the development environment, ensure the following are configured properly, and your are running the appropiate commands.

#### Requirements

- [Docker](https://docs.docker.com/engine/install/) installed on your machine. It will provide the virtual environment needed to run a Github Action
- [nektos/act](https://github.com/nektos/act) installed. This is the software that uses Docker to create a container, that resembles a Github Action Environment for testing
- Have a package manager installed (i.e, npm, yarn, etc)

#### Running Dev Environment

1. Run `npm i`
2. Run `npm run dev`
