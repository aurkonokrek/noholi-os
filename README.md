# Remix of Remix of Noholi Library Hub

PROMPT:

Design a professional web-based Library Admin Dashboard UI for a system named “Noholi”.

This is a real internal operational system for daily staff use.
It is NOT a marketing website and NOT a reader browsing platform.

The interface must prioritize:

Speed

Clarity

Low cognitive load

Data density

Functional usability over aesthetics

No promotional banners.
No decorative illustrations.
No emotional storytelling elements.

🧱 Core Layout

Create:

Left vertical sidebar navigation (text-first, minimal icons)

Top bar with global search

Main content area using responsive grid layout

Clean spacing system

Neutral professional color palette

Subtle shadows

Minimal rounded corners

👥 Role-Based System

There are 3 roles:

Admin – full access
Staff – operational access only
Manager – analytics-focused, read-only

Design the layout so sidebar items and actions can be conditionally hidden based on role.

Do NOT create separate UIs.
Create one scalable layout.

📂 Sidebar Navigation

Include:

Dashboard
Inventory
Lending
Members
Donations
Fines
Reports
Settings

Structure must support scalability.

📊 Dashboard (Default View)

Top Summary Cards:

Total Books

Books on Loan

Overdue Today

Active Members

Donations This Month

Below:

Recent Activity table:

Book
Member
Action (Issued / Returned / Donated)
Date
Status

Use structured tables — not card grids.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/824f2a6c-7c88-4cae-bd08-f8b9fb643424).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
