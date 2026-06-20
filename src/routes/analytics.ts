import express from 'express';
import { authenticateJWT } from '../middlewares/auth';
import {
  getTaskStatusAnalytics,
  getAgentPerformanceAnalytics,
  getTenantActivityAnalytics
} from '../services/analyticsService';

const router = express.Router();

router.get('/task-status', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req;
    const analytics = await getTaskStatusAnalytics(tenantId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/agent-performance', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req;
    const analytics = await getAgentPerformanceAnalytics(tenantId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/tenant-activity', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req;
    const analytics = await getTenantActivityAnalytics(tenantId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
