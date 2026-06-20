# Architecture

This system is comprised of multiple services and APIs built with Node.js and Express, using PostgreSQL as the database with Prisma ORM. It integrates real-time features using Socket.IO and supports file storage and retrieval through AWS S3. The backend is containerized with Docker, and Redis is employed for caching and task queuing with BullMQ. Authentication is handled with JWT, and extensive use of middleware allows for role-based access control. The backend ensures multi-tenant isolation by filtering all queries through a tenant ID.
