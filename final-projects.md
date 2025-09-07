src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (guest)/
│   │   └── page.tsx (Landing page with read-only access)
│   └── (admin)/
│       ├── dashboard/
│       │   └── page.tsx
│       └── projects/
│           ├── page.tsx (Project listing)
│           ├── new/
│           │   └── page.tsx (New project form)
│           └── [id]/
│               ├── page.tsx (Project details overview)
│               ├── rab/
│               │   ├── page.tsx (RAB listing)
│               │   ├── new/
│               │   │   └── page.tsx (Create RAB)
│               │   └── [rabId]/
│               │       └── page.tsx (RAB details/edit)
│               ├── transactions/
│               │   ├── page.tsx (Transactions listing)
│               │   ├── new/
│               │   │   └── page.tsx (Create transaction)
│               │   └── [transactionId]/
│               │       └── page.tsx (Transaction details/edit)
│               └── invoices/
│                   ├── page.tsx (Invoices listing)
│                   ├── new/
│                   │   └── page.tsx (Create invoice)
│                   └── [invoiceId]/
│                       ├── page.tsx (Invoice details/edit)
│                       └── export/
│                           └── page.tsx (Export invoice)
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── project-layout.tsx (Layout for project pages with sidebar)
│   ├── auth/
│   │   └── login-form.tsx
│   └── projects/
│       ├── project-form.tsx
│       ├── project-card.tsx (For dashboard listing)
│       ├── project-details.tsx
│       ├── rab/
│       │   ├── rab-form.tsx
│       │   ├── rab-list.tsx
│       │   └── rab-detail.tsx
│       ├── transactions/
│       │   ├── transaction-form.tsx
│       │   ├── transaction-list.tsx
│       │   └── transaction-detail.tsx
│       └── invoices/
│           ├── invoice-form.tsx
│           ├── invoice-list.tsx
│           ├── invoice-detail.tsx
│           └── invoice-export.tsx
├── lib/
│   ├── supabase/
│   │   └── client.ts
│   │   └── server.ts (jika diperlukan)
│   ├── utils/
│   │   ├── auth.ts
│   │   ├── format.ts (For formatting dates, currency(menggunakan rupiah indonesia saja), etc.)
│   │   └── export.ts (For handling invoice exports)
│   └── types/
│       ├── project.ts
│       ├── rab.ts
│       ├── transaction.ts
│       └── invoice.ts
├── hooks/
│   ├── use-projects.ts
│   ├── use-rab.ts
│   ├── use-transactions.ts
│   └── use-invoices.ts
└── middleware.ts (for route protection)


