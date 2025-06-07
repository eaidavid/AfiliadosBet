import express from 'express';
import { storage } from './storage';

const router = express.Router();

// Simple webhook receiver for betting houses to send conversion data
router.post('/conversions', async (req: any, res: any) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ 
        success: false,
        error: 'API Key required'
      });
    }

    // For demo purposes, accept test keys
    if (!apiKey.toString().includes('demo') && !apiKey.toString().includes('test')) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid API Key'
      });
    }

    const { event_type, customer_id, subid, amount, commission, metadata } = req.body;

    if (!event_type || !customer_id || !subid) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: event_type, customer_id, subid'
      });
    }

    // Create conversion record (simplified for demo)
    const conversionData = {
      userId: 1, // Demo affiliate ID
      houseId: 1, // Demo house ID
      type: event_type,
      amount: amount || null,
      commission: commission || null,
      customerId: customer_id,
      conversionData: metadata || {}
    };

    // For demo, return success without database dependency
    const conversionId = Math.floor(Math.random() * 10000);

    return res.status(200).json({
      success: true,
      message: 'Conversion received and processed',
      data: {
        conversion_id: conversionId,
        affiliate: {
          id: 1,
          username: subid,
          email: `${subid}@exemplo.com`
        },
        house: {
          id: 1,
          name: 'Casa Demo'
        },
        event_type,
        amount: amount || '0.00',
        commission: commission || '0.00',
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing conversion:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/clicks', async (req: any, res: any) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ 
        success: false,
        error: 'API Key required'
      });
    }

    const { subid } = req.body;

    if (!subid) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: subid'
      });
    }

    const clickId = Math.floor(Math.random() * 10000);

    return res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      data: {
        click_id: clickId,
        affiliate_id: 1,
        house_id: 1
      }
    });

  } catch (error) {
    console.error('Error processing click:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track click'
    });
  }
});

router.get('/ping', async (req: any, res: any) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Webhook endpoint is active',
    house: {
      id: 1,
      name: 'Casa Demo'
    },
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /webhook/conversions - Receive conversions',
      'POST /webhook/clicks - Receive clicks',
      'GET /webhook/ping - Test connectivity'
    ]
  });
});

export { router as simpleWebhookRouter };