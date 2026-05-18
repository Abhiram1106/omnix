/**
 * Current vault schema version. Bump when adding migrations.
 * Used by `omnix init` (to write the marker) and `omnix vault migrate` (target version).
 */
export const CURRENT_VAULT_VERSION = "1.1";

/** Filename inside .omnix/ that stores the current vault version. */
export const VAULT_VERSION_FILE = ".omnix-vault-version";
