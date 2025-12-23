# Selection Furniture - Sales Management Dashboard

A modern, responsive sales management application built for Selection Furniture to track sales, manage customer payments, and generate professional invoices. This application is developed using **Next.js 15**, **React 19**, **TypeScript**, and **Firebase**.

![Dashboard Preview](./public/placeholder-logo.png)

## 🚀 Features

-   **Sales Tracking**: View a comprehensive list of all sales with status indicators (Paid/Partial) and delivery status.
-   **Customer Management**: Store customer details including name, phone number, and delivery address.
-   **Payment Processing**: 
    -   Record initial deposits and subsequent partial payments.
    -   Real-time calculation of "Amount Due".
    -   Visual history of all payments made for a specific sale.
-   **Invoicing**: 
    -   Generate and download professional PDF invoices instantly.
    -   Client-side PDF generation using `jspdf`.
-   **Data Management**:
    -   Real-time data synchronization using **Firebase Firestore**.
    -   Export sales data to CSV for external analysis.
    -   Search functionality to quickly find customer orders.
-   **Responsive UI**: Built with **Tailwind CSS** and **shadcn/ui** components for a clean, mobile-friendly interface.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
-   **Backend/Database**: [Firebase Firestore](https://firebase.google.com/)
-   **PDF Generation**: [jspdf](https://github.com/parallax/jsPDF)
-   **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   npm, pnpm, or yarn

You will also need a **Firebase Project** set up with a Firestore database enabled.

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/sales-management.git](https://github.com/yourusername/sales-management.git)
    cd sales-management
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Firebase configuration keys. You can find these in your Firebase Project Settings.

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    # or
    pnpm dev
    ```

5.  **Open the app**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```text
├── app/
│   ├── api/            # API routes (e.g., server-side PDF generation)
│   ├── globals.css     # Global styles and Tailwind directives
│   ├── layout.tsx      # Root layout with font configurations
│   └── page.tsx        # Main entry point rendering SalesDashboard
├── components/
│   ├── ui/             # Reusable shadcn/ui components (Button, Input, etc.)
│   ├── add-payment-modal.tsx # Modal logic for recording payments
│   ├── add-sale-modal.tsx    # Multi-step form for creating new sales
│   ├── invoice-component.tsx # Invoice preview and download logic
│   ├── sales-dashboard.tsx   # Main dashboard view and logic
│   └── theme-provider.tsx    # Next-themes provider
├── lib/
│   ├── firebase.ts     # Firebase initialization and export
│   └── utils.ts        # Utility functions (cn class merger)
└── public/             # Static assets