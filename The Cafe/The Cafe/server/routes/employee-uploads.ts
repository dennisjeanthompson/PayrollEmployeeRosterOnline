/**
 * Employee Photo and Document Upload API Routes
 * 
 * Handles Cloudinary image/document storage for:
 * - Profile photos
 * - ID documents (SSS, PhilHealth, Pag-IBIG, TIN)
 * - Supporting documents
 */

import { Router } from 'express';
import { db } from '../db';
import { users, employeeDocuments } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

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

/**
 * GET /api/employees/:id/documents
 * Get all documents for an employee
 */
router.get('/:id/documents', async (req, res) => {
  const { id } = req.params;

  try {
    const docs = await db
      .select()
      .from(employeeDocuments)
      .where(eq(employeeDocuments.userId, id));

    res.json(docs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * POST /api/employees/:id/documents
 * Upload a new document for an employee
 */
router.post('/:id/documents', async (req, res) => {
  const { id } = req.params;
  const { type, name, publicId, url, format, size } = req.body;
  const uploadedBy = (req as any).user?.id;

  if (!type || !name || !publicId || !url) {
    return res.status(400).json({ error: 'type, name, publicId, and url are required' });
  }

  try {
    const docId = uuid();
    await db.insert(employeeDocuments).values({
      id: docId,
      userId: id,
      type,
      name,
      publicId,
      url,
      format: format || null,
      size: size || null,
      uploadedBy: uploadedBy || null,
    });

    res.json({
      id: docId,
      type,
      name,
      publicId,
      url,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

/**
 * DELETE /api/employees/:id/documents/:docId
 * Delete a document
 */
router.delete('/:id/documents/:docId', async (req, res) => {
  const { docId } = req.params;

  try {
    await db
      .delete(employeeDocuments)
      .where(eq(employeeDocuments.id, docId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
