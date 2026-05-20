/**
 * Set by `MobileDatabaseProvider` after `/api/mobile/health` succeeds.
 * Module-level so listing/message contexts avoid a separate React context hook
 * (prevents Hermes "Property 'databaseConnected' doesn't exist" on bad imports).
 */
let postgresLinked = false;

export function setMobilePostgresLinked(value: boolean): void {
  postgresLinked = value;
}

export function isMobilePostgresLinked(): boolean {
  return postgresLinked;
}
