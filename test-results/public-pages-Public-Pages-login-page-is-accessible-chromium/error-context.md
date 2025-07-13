# Page snapshot

```yaml
- banner:
  - link "RankPilot":
    - /url: /
  - navigation:
    - link "Features":
      - /url: /#features
    - link "Pricing":
      - /url: /#pricing
    - link "FAQ":
      - /url: /#faq
  - link "Login":
    - /url: /login
  - link "Sign Up":
    - /url: /register
- main:
  - heading "Login" [level=2]
  - text: Email
  - textbox
  - text: Password
  - textbox
  - button "Login"
  - text: Or continue with
  - button "Sign in with Google":
    - img
    - text: Sign in with Google
  - paragraph:
    - text: Don't have an account?
    - link "Register":
      - /url: /register
- contentinfo:
  - paragraph: Built by an AI agent in Firebase Studio.
  - paragraph: © 2025 RankPilot
- region "Notifications (F8)":
  - list
- alert
```