export function validateEnvironment(input: Record<string, unknown>) {
  const env = { ...input };
  for (const [key, fallback] of [
    ['PORT', 3000],
    ['DB_PORT', 5432],
  ] as const) {
    const value = Number(env[key] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      throw new Error(`${key} deve ser uma porta válida.`);
    }
    env[key] = value;
  }
  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (typeof env[key] !== 'string' || !(env[key] as string).trim()) {
      throw new Error(`${key} é obrigatório.`);
    }
  }
  const origin = env.CORS_ORIGIN ?? 'http://localhost:5173';
  if (typeof origin !== 'string') throw new Error('CORS_ORIGIN inválido.');
  const url = new URL(origin);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
    throw new Error('CORS_ORIGIN deve conter uma origem HTTP sem caminho.');
  }
  env.CORS_ORIGIN = origin;
  return env;
}
