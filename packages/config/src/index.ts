import fs from "node:fs";
import path from "node:path";

type LocalSettingsFile = {
  Values?: Record<string, string | number | boolean>;
};

function findLocalSettingsFile(startDir: string): string | null {
  let current = startDir;

  while (true) {
    const candidate = path.join(current, "local.settings.json");
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function readLocalSettingsValues(): Record<string, string | number | boolean> {
  const filePath = findLocalSettingsFile(process.cwd());
  if (!filePath) {
    return {};
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, "")) as LocalSettingsFile;
  return parsed.Values ?? {};
}

export function getSetting(key: string): string | undefined {
  const localSettings = readLocalSettingsValues();
  const fromJson = localSettings[key];
  if (fromJson !== undefined) {
    return String(fromJson);
  }

  return process.env[key];
}

export function getRequiredSetting(key: string): string {
  const value = getSetting(key);
  if (!value) {
    throw new Error(`${key} is required. Set it in local.settings.json (Values.${key}) or environment variables.`);
  }

  return value;
}