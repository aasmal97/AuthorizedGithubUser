import { execShellCommand, findPackageJson } from "../utils/execShellCommand";
import { build } from "./buildScript";
import path from "path";
const testGeneralGithubAction = async (packageJsonPath: string) => {
  //test github action
  const testFilePath = path.join("test", "workflows", "test_workflow.yml");
  const secretsFilePath = path.join("test", "workflows", "my.secrets");
  const command = `act -W ${testFilePath} --secret-file ${secretsFilePath}`;
  await execShellCommand(command, {
    cwd: packageJsonPath,
  });
};
const testGroupGithubAction = async (packageJsonPath: string) => {
  //test github action generate env file
  const testFileGroupFilePath = path.join(
    "test",
    "workflows",
    "test_workflow_groups.yml"
  );
  const secretsGroupFilePath = path.join(
    "test",
    "workflows",
    "my.secrets"
  );
  const groupCommand = `act -W ${testFileGroupFilePath} --secret-file ${secretsGroupFilePath}`;
  await execShellCommand(groupCommand, {
    cwd: packageJsonPath,
  });
};
const main = async () => {
  const packageJsonPath = findPackageJson(__dirname);
  if (!packageJsonPath) return console.log("no package.json found");
  //build action.yml file
  await build();
  // await testGeneralGithubAction(packageJsonPath);
  await testGroupGithubAction(packageJsonPath);
};
if (require.main === module) main();
