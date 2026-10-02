# shopee-mcp — operating playbook

Placeholder. Populate once real Shopee shop/campaign data exists, mirroring
`efloor/docs/ads/operating-playbook.md`'s structure:

- Account/shop identifiers, structure snapshot.
- Gates table (change -> precondition), calibrated from real order/spend
  volume — see `src/playbook/gates.js` for the draft tier structure.
- Protected settings: campaigns/settings not to touch without explicit
  sign-off (starts empty, fill in as real campaigns exist).
- Weekly review flow (`npm run weekly-ads-review`).
