# Primadev Store

Official digital license store for software products developed by **PT Primadev Digital Technology**.

Live at: [store.primadev.id](https://store.primadev.id)

---

## Overview

Primadev Store is the official platform for purchasing and managing software licenses for products developed by Primadev Digital Technology. The platform provides instant license delivery, automated activation, and full purchase documentation.

## Features

- Browse and purchase software licenses
- Multiple payment methods supported
- Automatic license delivery upon successful payment
- License renewal management
- License validity checker
- Invoice generation in PDF format
- Bilingual interface (Bahasa Indonesia & English)
- Dark and light theme support

## Pages

| Route                | Description                      |
| -------------------- | -------------------------------- |
| `/`                | Product catalog and landing page |
| `/checkout`        | Purchase and payment flow        |
| `/waiting-payment` | Payment status monitoring        |
| `/thankyou`        | Post-payment confirmation        |
| `/renew`           | License renewal                  |
| `/check-license`   | License status checker           |
| `/support`         | Customer support                 |

## Tech Stack

| Category  | Technology                 |
| --------- | -------------------------- |
| Framework | Next.js 16 (App Router)    |
| Runtime   | React 19                   |
| Styling   | CSS Modules / Global CSS   |
| Icons     | Lucide React               |
| Database  | Firebase Realtime Database |
| Email     | Nodemailer                 |
| PDF       | pdf-lib                    |
| Payment   | Midtrans Payment Gateway   |

## Requirements

- Node.js 18 or later
- npm or yarn

## Getting Started

Clone the repository and install dependencies:

```bash
npm install
```

Copy the environment file and fill in the required values:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

The application runs on port `3001` by default. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Build

```bash
npm run build
npm run start
```

## Environment Variables

Required environment variables are listed in `.env.example`. **Never commit `.env.local` to version control.**

## License

This project is proprietary software. All rights reserved by **PT Primadev Digital Technology**.
See [LICENSE](./LICENSE) for full terms.

---

&copy; 2024-2026 PT Primadev Digital Technology. All rights reserved.
[primadev.id](https://primadev.id) | [store.primadev.id](https://store.primadev.id)
