# Ticketing (think concert tickets)

This is a remix of the app built in the course [microservices with node.js and react](https://www.udemy.com/course/microservices-with-node-js-and-react/) starting at chapter 5.
Source code for the course can be found [here](https://github.com/StephenGrider/ticketing).

This repository shows:

- another way to manage shared/common modules (with [Nx](https://nx.dev))
- tricks to use [Fastify](https://fastify.dev) with [NestJS](https://nestjs.com)
- tricks to consume and produce ES6 modules with NestJS (and Nx)
- how to integrate [Ory network](https://ory.sh) in NestJS and Angular apps for authentication and authorization flows
- how to setup Ory in local and remote working environments
- how to use [RabbitMQ](https://www.rabbitmq.com) with NestJS
- how to define/validate environment variables
- how to containerize Nx apps with [Docker](https://www.docker.com)
- how to integrate Nx into a [Kubernetes](https://kubernetes.io) workflow
- how to dynamically rebuild Docker images based on Nx dependencies graph

## User story

```mermaid
journey
  title Exchanging tickets online
  section Register
    Create a user: 3: Seller, Buyer
    Signin : 3: Seller
  section Search tickets
    Find by name: 5: Buyer, Seller
  section Create ticket offer
    Write description: 3: Seller
    Define price: 3: Seller
  section Buy ticket
    Reserve tickets: 5: Buyer
    Place order: 3: Buyer
    Pay ticket: 3: Buyer
  section Check orders
    See orders list: 5: Seller, Buyer
```

## Architecture

```mermaid
---
title: Ticketing architecture
---
flowchart LR
%% defining styles
    classDef app fill:#f7e081,stroke:#333,stroke-width:1px

%% defining entities
    FE[Angular app]
    LB[Nginx proxy]
    A[Auth API]
    A-M[(Mongo)]
    T[Tickets API]
    T-M[(Mongo)]
    O[Orders API]
    O-M[(Mongo)]
    P[Payments API]
    P-M[(Mongo)]
    St[Stripe]
    E[Expiration API]
    E-R[(Redis)]
    RMQ[RabbitMQ]
    Kr[Kratos]
    Ke[Keto]
    Hy[Hydra]

%% assigning styles to entities
    %%AS,OS,ES,TS,PS:::service
    %%class A,T,O,E,P,FE app;

%% flow
    FE -->|HTTP| LB
    FE -->|HTTP| St <-->|HTTP| PS
    FE -->|HTTP| ORY <-->|HTTP| AS
    LB --->|HTTP| AS & TS & OS & PS
    RMQ <-.->|AMQP| TS & OS & ES & PS
    TS & OS & PS -->|HTTP| ORY
    subgraph AS [Auth service]
    direction LR
    A --> A-M
    end
    subgraph ORY [Ory Network]
    direction LR
    Kr
    Ke
    Hy
    end
    subgraph TS [Tickets service]
    direction LR
    T --> T-M
    end
    subgraph OS [Orders service]
    direction LR
    O --> O-M
    end
    subgraph ES [Expiration service]
    direction LR
    E <--> E-R
    end
    subgraph PS [Payments service]
    direction LR
    P --> P-M
    end

```

## Entities

```mermaid
---
title: Ticketing entities
---
erDiagram
    User ||--o{ Ticket : owns
    User ||--o{ Order : owns
    User ||--o{ Payment : owns
    Ticket ||--o| Order : "bound to"
    Order ||--o| Payment : "bound to"

    User {
        int id PK
        string email "unique"
    }
    Ticket {
        string id PK
        string title
        float price
        int version
        string userId FK
        string orderId FK "Optional"
    }
    Order {
        string id PK
        string status
        int version
        string ticketId FK
        string userId FK
    }
    Payment {
        string id PK
        string orderId FK
        string stripeId "Charge ID from Stripe"
        int version
    }
```

## Permissions

Permissions are granted or denied using Ory Permissions (Keto) [policies](https://www.ory.sh/docs/keto/).

```mermaid
---
title: Entities namespaces and relationships
---
classDiagram

    NamespaceRelations *-- Namespace
    NamespacePermissions *-- Namespace
    Namespace <|-- User
    Namespace <|-- Group
    Namespace <|-- Ticket
    Namespace <|-- Order
    Namespace <|-- Payment
    Group o-- User : "members"
    Ticket o-- User : "owners"
    Order o-- User : "owners"
    Order *-- Ticket : "parents"
    Payment o-- User : "owners"
    Payment *-- Order : "parents"

    class Context {
      <<Interface>>
      subject: never;
    }

    class NamespaceRelations {
        <<Interface>>
        +[relation: string]: INamespace[]
    }

    class NamespacePermissions {
        <<Interface>>
        +[method: string]: (ctx: Context) => boolean
    }

    class Namespace {
        <<Interface>>
        -related?: NamespaceRelations
        -permits?: NamespacePermissions
    }

    class User {
    }

    note for Group "<i>Users</i> can be <b>members</b> of a <i>Group</i>"
    class Group {
        +related.members: User[]
    }

    note for Ticket "<i>Users</i> (in owners) are allowed to <b>edit</b>. \nHowever <i>Ticket</i> <b>owners</b> cannot <b>order</b> a Ticket. \nImplicitly, anyone can <b>view</b> Tickets"
    class Ticket {
        +related.owners: User[]
        +permits.edit(ctx: Context): boolean
        +permits.order(ctx: Context): boolean
    }

    note for Order "<i>Order</i> is bound to a <i>Ticket</i>. \n<i>Users</i> (in <b>owners</b>) are allowed to <b>view and edit</b>. \n <i>Order's Ticket</i> <b>owners</b> are allowed to <b>view</b>."
    class Order {
        +related.owners: User[]
        +related.parents: Tickets[]
        +permits.edit(ctx: Context): boolean
        +permits.view(ctx: Context): boolean
    }

    note for Payment "<i>Payment</i> is bound to a Ticket's <i>Order</i>. \n<i>Users</i> (in <b>owners</b>) are allowed to <b>view and edit</b>. \n<i>Payment</i> can be <b>viewed</b> by <i>Order's Ticket</i> <b>owners</b>."
    class Payment {
        +related.owners: User[]
        +related.parents: Order[]
        +permits.edit(ctx: Context): boolean
        +permits.view(ctx: Context): boolean
    }
```

## Events

```mermaid
sequenceDiagram
  participant Tickets service
  participant Orders service
  participant Payments service
  participant Expiration service
  participant RMQ

  loop ticket:created
    %% event emitted by tickets service
    Tickets service->>+RMQ: Publish new ticket
    RMQ-->>-Orders service: Dispatch new ticket
    Note left of Orders service: Orders service needs to know <br> about tickets that can be reserved.
  end

  loop ticket:updated
    %% event emitted by tickets service
    Tickets service->>+RMQ: Publish updated ticket
    RMQ-->>-Orders service: Dispatch updated ticket
    Note left of Orders service: Orders service needs to know <br> if tickets price have changed and <br>if they are successfully reserved
  end

  loop order:created
    %% event emitted by orders service
    Orders service->>+RMQ: Publish new order
    par RMQ to Tickets service
      RMQ->>Tickets service: Dispatch new order
      Note left of Tickets service: Tickets service needs to know<br>if a ticket has been reserved<br>to prevent its edition.
      and RMQ to Payments service
      RMQ->>Payments service: Dispatch new order
      Note left of Payments service: Payments service needs to know<br>there is a new order that a user<br>might submit a payment for.
      and RMQ to Expiration service
      RMQ->>Expiration service: Dispatch new order
      Note left of Expiration service: Expiration service needs to start<br>a timer to eventually time out<br>this order.
    end
  end


  loop order:cancelled
    %% event emitted by orders service
    Orders service->>+RMQ: Publish cancelled order
    par RMQ to Tickets service
      RMQ->>Tickets service: Dispatch cancelled order
      Note left of Tickets service: Tickets service should unreserve ticket<br>if the corresponding order has been<br>cancelled so this ticket can be <br>edited again
      and RMQ to Payments service
      RMQ->>Payments service: Dispatch cancelled order
      Note left of Payments service: Payments service should know that<br>any incoming payments for this order<br>should be rejected
    end
  end

  loop expiration:complete
    %% event emitted by expiration service
    Expiration service->>+RMQ: Publish complete expiration
    par RMQ to Orders service
      RMQ->>Orders service: Dispatch expired order
      Note left of Orders service: Orders service needs to know that an order<br>has gone over the 15 minutes time limit.<br>It is up to the order service to decide<br> wether or not to cancel the order.
    end
  end

  loop payment:created
    %% event emitted by payments service
    Payments service->>+RMQ: Publish payment created
    par RMQ to Orders service
      RMQ->>Orders service: Dispatch payment created
      Note left of Orders service: Orders service needs to know that an order<br>has been paid for.
    end
  end
```

## Useful commands

... to run after configuring the required environment variables

```bash
# build custom Nginx Proxy
yarn docker:nginx:build

# build custom RabbitMQ node
yarn docker:rmq:build

# start the Storage and Broker dependencies (mongo, redis, rabbitmq)
yarn docker:deps:up

# start Nginx Proxy (for backend services and frontend app)
yarn docker:proxy:up

# Generate Ory network configuration from .env
yarn ory:generate:kratos
yarn ory:generate:keto

# start Ory network (Kratos and Keto with database migrations)
yarn docker:ory:up

# start backend services
yarn start:backend

# start (Angular) frontend app
yarn start:frontend:local

```
