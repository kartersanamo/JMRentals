import { randomBytes } from "crypto";

export const PROPOSAL_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export function generateProposalToken(): string {
  return randomBytes(32).toString("hex");
}

export function getProposalTokenExpiry(): Date {
  return new Date(Date.now() + PROPOSAL_TOKEN_EXPIRY_MS);
}
