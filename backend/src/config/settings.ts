export function getSetting(key: string): string | undefined {
  return process.env[key];
}

export function getRequiredSetting(key: string): string {
  const value = getSetting(key);

  if (!value) {
    throw new Error(`${key} is required. Set it in backend/.env or environment variables.`);
  }

  return value;
}
