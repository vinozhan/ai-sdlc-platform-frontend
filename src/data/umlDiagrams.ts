export type UMLDiagramDefinition = {
  id: string;
  title: string;
  description: string;
  code: string;
};

export const umlDiagramList: UMLDiagramDefinition[] = [
  {
    id: "class",
    title: "Class Diagram",
    description: "Core domain classes for users, payments, KYC, and gateway integration.",
    code: `classDiagram
    direction TB
    class User {
      +String id
      +String email
      +String role
      +authenticate()
      +updateProfile()
    }
    class Transaction {
      +String id
      +Decimal amount
      +String currency
      +String status
      +process()
      +refund()
    }
    class KYCRecord {
      +String id
      +String status
      +Date submittedAt
      +verify()
      +reject()
    }
    class PaymentService {
      +charge(amount)
      +refund(transactionId)
      +validateCard()
    }
    class PaymentGateway {
      +authorize()
      +capture()
      +void()
    }
    class AuditLog {
      +String id
      +String action
      +DateTime timestamp
      +record()
    }
    class Session {
      +String id
      +DateTime expiresAt
      +invalidate()
    }
    User "1" --> "*" Transaction : makes
    User "1" --> "1" KYCRecord : has
    User "1" --> "*" Session : creates
    PaymentService --> Transaction : manages
    PaymentService --> PaymentGateway : uses
    Transaction "1" --> "*" AuditLog : generates`,
  },
  {
    id: "er",
    title: "ER Diagram",
    description: "Relational schema linking users, transactions, sessions, and audit trails.",
    code: `erDiagram
    USER ||--o{ TRANSACTION : makes
    USER ||--|| KYC_RECORD : has
    USER ||--o{ SESSION : creates
    TRANSACTION ||--o{ AUDIT_LOG : generates
    PAYMENT_GATEWAY ||--o{ TRANSACTION : processes
    USER {
      string id PK
      string email UK
      string role
      datetime created_at
    }
    TRANSACTION {
      string id PK
      string user_id FK
      decimal amount
      string currency
      string status
      datetime created_at
    }
    KYC_RECORD {
      string id PK
      string user_id FK
      string status
      date submitted_at
    }
    SESSION {
      string id PK
      string user_id FK
      datetime expires_at
    }
    AUDIT_LOG {
      string id PK
      string transaction_id FK
      string action
      datetime timestamp
    }
    PAYMENT_GATEWAY {
      string id PK
      string provider
      string endpoint
    }`,
  },
  {
    id: "activity",
    title: "Activity Diagram",
    description: "End-to-end payment checkout workflow from authentication to confirmation.",
    code: `flowchart TD
    A([Customer initiates payment]) --> B{Authenticated?}
    B -->|No| C[Redirect to login]
    C --> D[Validate credentials]
    D --> B
    B -->|Yes| E[Load cart and totals]
    E --> F[Validate card details]
    F --> G{Card valid?}
    G -->|No| H[Show validation error]
    H --> F
    G -->|Yes| I[Authorize via payment gateway]
    I --> J{Authorization OK?}
    J -->|No| K[Show payment failure]
    K --> L{Retry?}
    L -->|Yes| F
    L -->|No| M([End - failed])
    J -->|Yes| N[Capture payment]
    N --> O[Persist transaction]
    O --> P[Write audit log]
    P --> Q[Send confirmation email]
    Q --> R([End - success])`,
  },
  {
    id: "sequence",
    title: "Sequence Diagram",
    description: "Request flow for POST /api/v1/payments across frontend, gateway, and provider.",
    code: `sequenceDiagram
    autonumber
    actor C as Customer
    participant FE as Frontend
    participant GW as API Gateway
    participant PS as Payment Service
    participant PG as Payment Gateway
    participant DB as Database

    C->>FE: Click Pay Now
    FE->>GW: POST /api/v1/payments
    GW->>GW: Validate JWT and rate limit
    GW->>PS: Forward charge request
    PS->>PS: Validate amount and currency
    PS->>PG: Authorize card
    PG-->>PS: Authorization code
    PS->>PG: Capture funds
    PG-->>PS: Capture confirmed
    PS->>DB: INSERT transaction
    DB-->>PS: transaction id
    PS->>DB: INSERT audit_log
    PS-->>GW: 201 Created
    GW-->>FE: Payment confirmed
    FE-->>C: Display receipt`,
  },
];

/** Legacy map for backward compatibility */
export const umlDiagrams = Object.fromEntries(
  umlDiagramList.map((d) => [d.id, d.code])
) as Record<string, string>;
