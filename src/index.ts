import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Delivery Management System');
});

app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
