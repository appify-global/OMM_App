---
name: unlisted-mobile-ux
description: Guides Unlisted mobile app UX decisions. Use when editing apps/mobile, React Native screens, navigation, mobile components, app theme tokens, or product flow.
---

# Unlisted Mobile UX

## Current Priority

The mobile app is Home-first while the core product experience is being refined. Signup, login, and onboarding can stay last unless explicitly reprioritized.

## Product Focus

- Buyer-first private property discovery
- Home screen as the main working surface
- Search, saved properties, buyer briefs, messages, and agent connection
- Keep seller/admin/auth flows secondary until core UX is stable

## Visual Rules

- Use existing mobile theme tokens from `apps/mobile/src/theme`.
- Match the app palette: forest, charcoal, cream, white, sage, muted borders.
- Keep controls compact and functional.
- Use active tab/icon states consistently.
- Avoid introducing new visual systems unless they become shared tokens.

## Navigation Rules

- Do not reintroduce signup/auth as the default initial route unless requested.
- Keep Home as the source-of-truth product surface during active UX work.
- New routes should support the buyer journey, not distract from it.

## Component Rules

- Prefer existing components and local style patterns.
- Do not create one-off button styles when `PrimaryButton`, `OutlineButton`, or existing patterns apply.
- Keep touch targets usable without making components visually oversized.
- Typography should be medium/regular except for clear hierarchy moments.
