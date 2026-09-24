export const BRANCH_STATUS = {
  ACTIVE_FOR_PICKUP_ONLY: "active_for_pickup_only",
  ACTIVE_FOR_BOTH: "active_for_both",
  INACTIVE_FOR_BOTH: "inactive_for_both",
};

export const BRANCH_STATUS_LABELS = {
  [BRANCH_STATUS.ACTIVE_FOR_PICKUP_ONLY]: "Active for Pickup Only",
  [BRANCH_STATUS.ACTIVE_FOR_BOTH]: "Active for Both",
  [BRANCH_STATUS.INACTIVE_FOR_BOTH]: "Inactive for Both",
};

const BRANCH_STATUS_ALIASES = {
  "Active for Pickup Only": BRANCH_STATUS.ACTIVE_FOR_PICKUP_ONLY,
  Active_for_Pickup_Only: BRANCH_STATUS.ACTIVE_FOR_PICKUP_ONLY,
  active_pickup: BRANCH_STATUS.ACTIVE_FOR_PICKUP_ONLY,
  "Active for Both": BRANCH_STATUS.ACTIVE_FOR_BOTH,
  Active_for_Both: BRANCH_STATUS.ACTIVE_FOR_BOTH,
  active_both: BRANCH_STATUS.ACTIVE_FOR_BOTH,
  "Inactive for Both": BRANCH_STATUS.INACTIVE_FOR_BOTH,
  Inactive_for_Both: BRANCH_STATUS.INACTIVE_FOR_BOTH,
  inactive_both: BRANCH_STATUS.INACTIVE_FOR_BOTH,
};

export function normalizeBranchStatus(status) {
  if (!status) return "";
  return BRANCH_STATUS_ALIASES[status] || status;
}

export function formatBranchStatusLabel(status) {
  const normalized = normalizeBranchStatus(status);
  return BRANCH_STATUS_LABELS[normalized] || normalized || "";
}

export function isPickupBranchStatus(status) {
  const normalized = normalizeBranchStatus(status);
  return (
    normalized === BRANCH_STATUS.ACTIVE_FOR_PICKUP_ONLY ||
    normalized === BRANCH_STATUS.ACTIVE_FOR_BOTH
  );
}

export function isDeliveryBranchStatus(status) {
  return normalizeBranchStatus(status) === BRANCH_STATUS.ACTIVE_FOR_BOTH;
}
