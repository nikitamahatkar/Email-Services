# Email Service

A resilient email sending service in JavaScript with retry logic, provider fallback, idempotency, rate limiting, and status tracking.

## Setup

### Prerequisites

- Node.js (v12+)

### Installation

1. Clone the repository:
    bash
    git clone <repository-url>
    cd email-service
    

2. Run the service:
    bash
    node emailService.js
    

3. Run tests:
    bash
    npm test
    

## Key Features

- *Retry Logic*: Retries with exponential backoff.
- *Fallback*: Switches providers on failure.
- *Idempotency*: Prevents duplicate sends.
- *Rate Limiting*: Controls send rate.
- *Status Tracking*: Logs email status.