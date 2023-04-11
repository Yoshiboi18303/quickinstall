#!/usr/bin/env node
// MIT License

// Copyright (c) 2023 Yoshiboi18303

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  text,
  multiselect,
} from "@clack/prompts";
import color from "picocolors";
import yargs from "yargs";
import {
  getIfProject,
  installPackages,
  exit,
  exec,
  getPackageManager,
  getConfig,
  logWithDate,
  cancel,
} from "./utils/";

const { start, stop } = spinner();

function getCommand(
  packages: string,
  packageManager: string,
  areDevDependencies: boolean
): string {
  let command: string;

  if (packageManager === "npm") {
    if (areDevDependencies) command = `npm install --save-dev ${packages}`;
    else command = `npm install ${packages}`;
  } else if (packageManager === "yarn") {
    if (areDevDependencies) command = `yarn add --dev ${packages}`;
    else command = `yarn add ${packages}`;
  } else {
    if (areDevDependencies) command = `pnpm install --save-dev ${packages}`;
    else command = `pnpm install ${packages}`;
  }

  return command;
}

async function getPackageManagerAndInstall(
  packages: string,
  isDebug?: unknown
): Promise<void> {
  const packageManager = await getPackageManager(isDebug);

  const areDevDependencies = await confirm({
    message: "Are the package(s) provided development dependencies?",
  });

  if (isCancel(areDevDependencies)) await cancel(isDebug);

  if (isDebug) {
    let command: string = getCommand(
      packages,
      String(packageManager),
      Boolean(areDevDependencies)
    );

    await logWithDate(`Running "${command}"...`);
  }

  start("Installing package(s)...");

  const exitCode = await installPackages(
    packages,
    packageManager,
    Boolean(areDevDependencies),
    isDebug
  );

  if (exitCode !== 0) stop(color.red("Installation failed..."));
  else stop("Installation succeeded!");
}

async function typeToInstall(isDebug?: unknown) {
  let packages = await text({
    message:
      "Please enter the package(s) you want to install (separated by spaces)",
  });

  if (isDebug) await logWithDate(`Packages provided: ${String(packages)}`);

  if (isCancel(packages)) await cancel(isDebug);

  packages = packages.toString();

  if (packages.length <= 0) exit("Please provide some packages to install!");

  await getPackageManagerAndInstall(packages, isDebug);
}

async function getQuery(isDebug?: boolean | unknown) {
  let query = await text({
    message: "Enter your search query",
  });

  if (isCancel(query)) await cancel(isDebug);

  query = String(query);

  return query;
}

async function getPackagesWithQuery(
  query: string,
  isDebug?: boolean | unknown
) {
  const { stdout } = await exec(`npm search --json "${query}"`);

  if (stdout.includes("[]")) {
    if (isDebug) logWithDate("Zero packages were found, exiting with error...");
    exit("No packages found!");
  }

  return JSON.parse(stdout);
}

async function getPackagesToInstall(
  options: any[],
  isDebug: boolean | unknown
): Promise<string> {
  const packagesToInstall = await multiselect({
    message: `Multiple packages found, please select which ones to install. ${color.gray(
      "(Arrow keys to navigate, space to select, return/enter to confirm)"
    )}`,
    options,
    required: true,
  });

  if (isCancel(packagesToInstall)) await cancel(isDebug);

  let output: string = Array(packagesToInstall).join(" ").trim();

  while (output.includes(",")) output = output.replace(",", " ");

  if (isDebug) await logWithDate(`Packages selected: ${output}`);

  return output;
}

async function searchAndInstall(isDebug?: unknown) {
  let query = await getQuery(isDebug);

  if (isDebug) {
    logWithDate(`Provided query: ${query}`);
    logWithDate(`Running 'npm search --json "${query}"'`);
  }

  start("Searching...");

  const packages = await getPackagesWithQuery(query, isDebug);

  stop();

  if (packages.length === 1) {
    const packageFound = packages[0];
    const shouldInstallPackage = await confirm({
      message: `Only one package found (${packageFound.name}), would you like to install it?`,
    });

    if (isCancel(shouldInstallPackage)) await cancel(isDebug);

    if (shouldInstallPackage)
      await getPackageManagerAndInstall(packageFound.name, isDebug);
  } else {
    const options = [];

    for (let i = 0; i < packages.length; i++) {
      const iteratedPackage = packages[i];
      options.push({
        value: iteratedPackage.name,
        label: iteratedPackage.name,
        hint: iteratedPackage.description,
      });
    }

    const packagesToInstall = await getPackagesToInstall(options, isDebug);

    const installPackages = await confirm({
      message: `Are these the correct packages? ${color.gray(
        `(${packagesToInstall.split(" ").join(", ")})`
      )}`,
    });

    if (isCancel(installPackages)) await cancel(isDebug);

    if (installPackages)
      await getPackageManagerAndInstall(packagesToInstall, isDebug);
  }
}

async function promptAndRun(isDebug: unknown): Promise<void> {
  const mode = await select({
    message: `Select a mode to run in. ${color.gray(
      "(Arrow keys to navigate, return/enter to select)"
    )}`,
    options: [
      {
        value: "type",
        label: "Type and install",
        hint: "Type package name(s) to install.",
      },
      {
        value: "search",
        label: "Search and install",
        hint: "Search for packages (that you ask for) and install them.",
      },
    ],
  });

  if (isCancel(mode)) await cancel(isDebug);

  switch (mode) {
    case "type":
      await typeToInstall(isDebug);
      break;
    case "search":
      await searchAndInstall(isDebug);
      break;
  }
}

async function main(): Promise<void> {
  const argv = await yargs(process.argv.slice(1)).option("debug", {
    alias: "d",
    type: "boolean",
    default: false,
  }).argv;

  // Get the configuration.
  const config = await getConfig();
  const isDebug: unknown = config?.debug || argv.debug;

  if (isDebug)
    await logWithDate(
      (date) =>
        `Started on ${date.getMonth()}/${date.getDay()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      undefined,
      false
    );
  // Log empty line for looks
  console.log();
  intro(color.inverse("Quick Install"));

  if (isDebug) await logWithDate("Checking for a package.json file...");

  const isProject = await getIfProject();

  if (!isProject) {
    if (isDebug) await logWithDate("File not found, exiting with error...");
    exit("Project does not have a package.json file!");
  }

  await promptAndRun(isDebug);

  let shouldContinue = await confirm({
    message: "Would you like to install more packages?",
  });

  if (isCancel(shouldContinue)) await cancel(isDebug);

  while (shouldContinue) {
    await promptAndRun(isDebug);

    shouldContinue = await confirm({
      message: "Would you like to install more packages?",
    });

    if (isCancel(shouldContinue)) await cancel(isDebug);
  }

  outro(
    color.green(
      "Thanks for using quickinstall, we hope to see you use this CLI again soon!"
    )
  );
}

main().catch(console.error);
