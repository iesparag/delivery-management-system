# Delivery Management System

This project is a multi-tenant delivery management platform similar to Tookan. It enables various roles to manage delivery operations effectively with features like task management, real-time tracking, and analytics.

## Setup

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file at the project root and provide valid values as shown in `.env.example`.
4. Start the development server using `npm run dev`.
5. Build the project using `npm run build` for production.
6. Run tests using `npm test`.

## Docker

To set up a development environment using Docker:

- Use the provided `docker-compose.yml` to start the services with `docker-compose up`.

## Tech Stack

- Node.js with TypeScript
- Express Framework
- PostgreSQL with Prisma ORM
- Socket.IO for real-time features
- AWS S3 for file storage
- BullMQ and Redis for message queuing and caching

## Architectural Overview

The system is comprised of multiple services and APIs built with Node.js and Express, using PostgreSQL as the database with Prisma ORM. It integrates real-time features using Socket.IO and supports file storage and retrieval through AWS S3. Authentication is handled with JWT, and middleware allows role-based access control.