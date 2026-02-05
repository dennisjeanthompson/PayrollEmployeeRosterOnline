/**
 * Employee Photo Upload API Routes
 * 
 * Handles Cloudinary image storage for profile photos
 */

import { Router } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();
import crypto from 'crypto';

/**
 * GET /api/employees/upload-signature
 * Generate a secure signature for client-side Cloudinary uploads
 */
router.get('/upload-signature', (req, res) => {
  try {
    const { public_id, folder } = req.query;

    if (!public_id || !folder) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return res.status(500).json({ error: 'Cloudinary configuration missing' });
    }

    // Cloudinary signature generation:
    // 1. Sort parameters alphabetically
    // 2. Join with & and =
    // 3. Append API Secret
    // 4. SHA1 hash
    
    // Note: upload_preset is NOT included if we are doing a manual signed upload 
    // without a specific signed preset. We'll rely on the standard upload API.
    const params: Record<string, any> = {
      folder,
      public_id,
      timestamp
    };

    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + apiSecret;

    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    res.json({
      signature,
      timestamp,
      apiKey,
      cloudName
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
});

/**
 * PATCH /api/employees/:id/photo
 * Update employee profile photo
 */
router.patch('/:id/photo', async (req, res) => {
  const { id } = req.params;
  const { photoUrl, photoPublicId } = req.body;

  if (!photoUrl || !photoPublicId) {
    return res.status(400).json({ error: 'photoUrl and photoPublicId are required' });
  }

  try {
    await db
      .update(users)
      .set({
        photoUrl,
        photoPublicId,
      })
      .where(eq(users.id, id));

    res.json({ success: true, photoUrl, photoPublicId });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

/**
 * DELETE /api/employees/:id/photo
 * Remove employee profile photo
 */
router.delete('/:id/photo', async (req, res) => {
  const { id } = req.params;

  try {
    await db
      .update(users)
      .set({
        photoUrl: null,
        photoPublicId: null,
      })
      .where(eq(users.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing photo:', error);
    res.status(500).json({ error: 'Failed to remove photo' });
  }
});

export default router;
