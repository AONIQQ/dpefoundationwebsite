// Per-send tokens are 64 lowercase hex characters (two random UUIDs).
export const validToken = (t: string) => /^[a-f0-9]{64}$/.test(t)
