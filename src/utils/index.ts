import * as fs from "fs/promises";
import * as path from "path";
import { exec as execSync } from "child_process";
import { promisify } from "util";
import { isCancel, select, cancel as cancelProgram } from "@clack/prompts";
import color from "picocolors";

type Config = {
  debug: boolean | unknown;
};
type MessageCallback = (date: Date) => string;

export const exec = promisify(execSync);
export const sleep = promisify(setTimeout);
export const linePrefix = "│ ";

async function getProject(): Promise<string[]> {
  return await fs.readdir(process.cwd());
}

function getExitCode(stderr: string): number {
  return stderr.length > 0 && !stderr.includes("WARN") ? 1 : 0;
}

export async function cancel(isDebug: unknown, exitCode: number = 0) {
  if (isDebug) await logWithDate("User cancelled operation.");
  exit("Operation cancelled.", exitCode);
}

export async function getConfig(): Promise<Config | null> {
  const project = await getProject();
  const currentDirectory = process.cwd();

  if (!project.includes("quickinstall.json")) return null;

  const contents = (
    await fs
      .readFile(path.join(currentDirectory, "quickinstall.json"))
      .catch(console.error)
  )?.toString();

  if (!contents) return null;

  const config = JSON.parse(contents);

  return config;
}

export async function getIfProject(): Promise<boolean> {
  return (await getProject()).includes("package.json");
}

export async function installPackages(
  packages: string,
  packageManager: unknown = "npm",
  areDevDependencies: boolean = false,
  debug: boolean | unknown = false
): Promise<number> {
  let exitCode: number;
  const [stderr, stdout] = await runInstallationCommand(
    packages,
    packageManager,
    areDevDependencies
  );

  if (debug) logOutputAndErrors(stderr, stdout);
  exitCode = getExitCode(stderr);

  return exitCode;
}

export function exit(message: string, exitCode: number = 0) {
  cancelProgram(message);
  process.exit(exitCode);
}

export async function getPackageManager(isDebug: boolean | unknown) {
  const packageManager = await select({
    message: "Select which package manager to use",
    options: [
      {
        value: "npm",
        label: "NPM",
      },
      {
        value: "yarn",
        label: "Yarn",
      },
      {
        value: "pnpm",
        label: "PNPM",
      },
    ],
  });

  if (isCancel(packageManager)) await cancel(isDebug);

  return packageManager;
}

export function getWhitespaces(length: number): string {
  let value = "";

  for (let i = 0; i < length; i++) {
    value += "\u0020";
  }

  return value;
}

export function getTime(date: Date): string {
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export async function logWithDate(
  message: string | MessageCallback,
  date: Date | undefined = undefined,
  withinIntro: boolean = true
): Promise<void> {
  if (!date) date = new Date();
  if (!(typeof message === "string")) message = message(date);
  console.log(
    `${withinIntro ? `${color.gray(linePrefix)}` : ""}${color.gray(
      getTime(date)
    )}${!withinIntro ? getWhitespaces(10) : getWhitespaces(8)}${color.cyan(
      message
    )}`
  );
  await sleep(0o500);
}

function logOutputAndErrors(stderr: string, stdout: string): void {
  if (stderr.length > 0) {
    for (const line of stderr.split("\n")) {
      console.log(`${color.gray(linePrefix)}${line}`);
    }
  }
  if (stdout.length > 0) {
    for (const line of stdout.split("\n")) {
      console.log(`${color.gray(linePrefix)}${line}`);
    }
  }
}

async function runInstallationCommand(
  packages: string,
  packageManager: unknown,
  areDevDependencies: boolean
): Promise<[string, string]> {
  let stderr: string;
  let stdout: string;

  if (packageManager === "npm") {
    if (areDevDependencies) {
      const executionOutput = await exec(`npm install --save-dev ${packages}`);
      stderr = executionOutput.stderr;
      stdout = executionOutput.stdout;
    } else {
      const executionOutput = await exec(`npm install ${packages}`);
      stderr = executionOutput.stderr;
      stdout = executionOutput.stdout;
    }
  } else if (packageManager === "yarn") {
    if (areDevDependencies) {
      const executionOutput = await exec(`yarn add --dev ${packages}`);
      stderr = executionOutput.stderr;
      stdout = executionOutput.stdout;
    } else {
      const executionOutput = await exec(`yarn add ${packages}`);
      stderr = executionOutput.stderr;
      stdout = executionOutput.stdout;
    }
  } else {
    if (areDevDependencies) {
      const executionOutput = await exec(`pnpm install --save-dev ${packages}`);
      stderr = executionOutput.stderr;
      stdout = executionOutput.stdout;
    } else {
      const executionOutput = await exec(`pnpm install ${packages}`);
      stderr = executionOutput.stderr;
      stdout = executionOutput.stdout;
    }
  }

  return [stderr, stdout];
}
