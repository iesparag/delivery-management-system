import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import setupSocket from './config/socket.js';

// Load environment variables
config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Delivery Management System');
});

app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

// Setup Socket.IO
setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
