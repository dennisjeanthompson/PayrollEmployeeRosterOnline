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
