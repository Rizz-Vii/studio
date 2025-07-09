# Document 5: Key User Workflows - RankPilot

**Product Name:** RankPilot
**Date:** July 9, 2025
**Purpose:** To define the step-by-step user journeys for achieving key goals within the application.

---

### Workflow 1: New User Onboarding & First Audit

*   **Persona:** A first-time visitor (e.g., Content Writer, Marketing Manager).
*   **Goal:** Sign up for a free account and experience the core value by running one audit.

| Step | User Action | System Response / Backend Action |
| :--- | :--- | :--- |
| 1 | Lands on the homepage ([https://rankpilot-h3jpc.web.app/](https://rankpilot-h3jpc.web.app/)) and clicks "Get Started Free". | Displays the registration form/modal. |
| 2 | Signs up using email/password or Google OAuth. | **(Backend)** Firebase Auth creates a new user account. A new `users/{userId}` document is created in Firestore. |
| 3 | Is redirected to the main dashboard. | Displays a welcome message and an optional onboarding tour. |
| 4 | Navigates to the "Content Audit" tool. | Shows the audit input form. |
| 5 | Enters a URL and clicks "Run Audit". | **(Backend)** The audit request is sent. The system checks if the user is within their free tier quota. |
| 6 | The audit is processed. | **(Backend)** The crawler fetches content, AI analysis is performed, and results are saved to `audits/{userId}/{auditId}`. |
| 7 | Views the audit results page. | Displays the summary report with a high-level score and key issues. |
| 8 | Clicks on a Pro-tier feature (e.g., "Rewrite with AI"). | Displays a paywall/modal prompting the user to upgrade their plan. |

---

### Workflow 2: Upgrading to a Paid Plan

*   **Persona:** A free user who has seen the value and hit a usage limit or feature wall.
*   **Goal:** Subscribe to a paid tier (e.g., Pro).

| Step | User Action | System Response / Backend Action |
| :--- | :--- | :--- |
| 1 | Clicks an "Upgrade" button from a paywall or the pricing page. | Redirects the user to the Stripe Checkout page. |
| 2 | Enters payment information and confirms the subscription. | **(Stripe)** Processes the payment. |
| 3 | Stripe successfully processes the payment. | **(Backend)** Stripe sends a `checkout.session.completed` webhook to a dedicated Cloud Function. |
| 4 | The webhook is received and verified. | **(Backend)** The Cloud Function updates the user's document in Firestore (`subscriptionStatus: 'active'`) and sets their role via Firebase Custom Claims (`role: 'pro'`). |
| 5 | User is redirected back to the RankPilot dashboard. | User sees a "Success!" message. Their auth token is refreshed, granting them immediate access to Pro features and increased quotas. |

---

### Workflow 3: Agency Consultant Managing a Client Project

*   **Persona:** Alex, the SEO Consultant (Agency Tier).
*   **Goal:** Run a comprehensive audit for a client, analyze the results, and export a report.

| Step | User Action | System Response / Backend Action |
| :--- | :--- | :--- |
| 1 | Logs in and navigates to the dashboard. | Dashboard displays an overview of all client projects/audits. |
| 2 | Starts a new audit for `client-website.com`. | **(Backend)** The system checks the agency-tier quota and decrements it. |
| 3 | The audit completes (potentially asynchronously). | User may receive an in-app or email notification. |
| 4 | Views the full, detailed audit report. | All NeuroSEO™ component data is available (SemanticMap, TrustBlock, etc.). |
| 5 | Uses `RewriteGen™` to draft improved headings and paragraphs. | The tool provides AI-powered suggestions based on the audit's findings. |
| 6 | Clicks "Export Report (PDF)". | **(Backend)** A report generation function pulls the audit data and creates a professional, white-labeled PDF. |
| 7 | Downloads the PDF. | The user can now share this tangible deliverable with their client. |