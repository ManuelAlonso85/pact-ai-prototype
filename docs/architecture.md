# Architecture and trust boundaries

```mermaid
flowchart LR
    U1["Participant"]
    U2["Accountability partner"]
    T["Twilio SMS/MMS"]

    subgraph S["Supabase project"]
        W["Inbound webhook / workflow state machine"]
        J["Scheduled reminder and evaluation workers"]
        DB[("Postgres: pacts, schedules, consent, outcomes")]
        M[("Private proof-media storage")]
        L[("Redacted operational logs")]
    end

    U1 <-->|"messages and proof"| T
    U2 <-->|"reviews and status"| T
    T -->|"signed webhook"| W
    W -->|"validated state changes"| DB
    W -->|"private media reference"| M
    DB -->|"due obligations only"| J
    J -->|"authorized send request"| T
    W --> L
    J --> L

    O["Human support — least privilege"] -.->|"exception review"| DB
    E["External payment between participants"]
    U1 <-.-> E
    U2 <-.-> E

    classDef external fill:#f7f7f7,stroke:#666,color:#111;
    classDef sensitive fill:#fff3cd,stroke:#9a6b00,color:#111;
    class U1,U2,T,E external;
    class DB,M,L sensitive;
```

## Boundary decisions

- Twilio webhook signatures and internal scheduled-job authentication are checked before state mutation.
- Service-role credentials stay server-side and are never placed in a client or screenshot.
- Phone numbers, proof media, consent, and outcomes are sensitive data; public demos use synthetic fixtures.
- Logs should use correlation identifiers and structured counts, not raw phone numbers, message bodies, or proof URLs.
- External settlement is outside the product boundary. The system records participant statements, not verified transfers.

