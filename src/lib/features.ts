// Feature flags.
//
// BILLING_ENABLED gates the paid plan entirely: free-tier limits (folders /
// photos) AND all the pay/upgrade UI (nav plan badge, /upgrade page).
//
// It's OFF for now — Tag It is free and unlimited for everyone while we grow
// the user base. To bring paid plans back later, flip this to `true` (and set
// the RAZORPAY_* env vars, see .env.example). All the billing code — limits,
// the upgrade page, the Razorpay subscription + webhook — is left in place and
// simply dormant, so re-enabling is just this one switch.
export const BILLING_ENABLED = false;
