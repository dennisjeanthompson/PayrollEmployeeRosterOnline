/**
 * Employee Photo Upload API Routes
 * 
 * Handles Cloudinary image storage for profile photos
 */

import { Router } from 'express';
import { db } from '../db';
import { users, employeeDocuments } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();
import crypto from 'crypto';

const canManageEmployeeData = async (sessionUser: any, targetUserId: string) => {
  if (!sessionUser) return false;
  if (sessionUser.id === targetUserId) return true;
  if (sessionUser.role === 'admin') return true;
  
  if (sessionUser.role === 'manager') {
    const targetUser = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (targetUser.length > 0 && targetUser[0].branchId === sessionUser.branchId) {
      return true;
    }
  }
  return false;
};

/**
 * GET /api/employees/:id/documents
 * Returns uploaded documents for an employee
 */
router.get('/:id/documents', async (req, res) => {
  const { id } = req.params;
  const sessionUser = req.session.user;

  if (!(await canManageEmployeeData(sessionUser, id))) {
    return res.status(403).json({ error: 'Not authorized to view these documents' });
  }

  try {
    const docs = await db
      .select()
      .from(employeeDocuments)
      .where(eq(employeeDocuments.userId, id));

    res.json(
      docs.map((doc) => ({
        id: doc.id,
        type: doc.type,
        name: doc.name,
        publicId: doc.publicId,
        url: doc.url,
        format: doc.format,
        size: doc.size,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching employee documents:', error);
    res.status(500).json({ error: 'Failed to fetch employee documents' });
  }
});

/**
 * POST /api/employees/:id/documents
 * Save uploaded document metadata for an employee
 */
router.post('/:id/documents', async (req, res) => {
  const { id } = req.params;
  const sessionUser = req.session.user;

  if (!(await canManageEmployeeData(sessionUser, id))) {
    return res.status(403).json({ error: 'Not authorized to upload documents for this user' });
  }

  const { type, name, publicId, url, format, size } = req.body || {};

  if (!type || !name || !publicId || !url) {
    return res.status(400).json({ error: 'type, name, publicId, and url are required' });
  }

  try {
    const docId = crypto.randomUUID();

    await db.insert(employeeDocuments).values({
      id: docId,
      userId: id,
      type,
      name,
      publicId,
      url,
      format: format || null,
      size: typeof size === 'number' ? size : null,
      uploadedBy: sessionUser?.id || null,
      createdAt: new Date(),
    });

    res.status(201).json({
      id: docId,
      type,
      name,
      publicId,
      url,
      format: format || null,
      size: typeof size === 'number' ? size : null,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating employee document:', error);
    res.status(500).json({ error: 'Failed to save employee document' });
  }
});

/**
 * DELETE /api/employees/:id/documents/:docId
 * Delete document metadata record
 */
router.delete('/:id/documents/:docId', async (req, res) => {
  const { id, docId } = req.params;
  const sessionUser = req.session.user;

  if (!(await canManageEmployeeData(sessionUser, id))) {
    return res.status(403).json({ error: 'Not authorized to delete documents for this user' });
  }

  try {
    await db
      .delete(employeeDocuments)
      .where(eq(employeeDocuments.id, docId));

    res.json({ success: true, id: docId });
  } catch (error) {
    console.error('Error deleting employee document:', error);
    res.status(500).json({ error: 'Failed to delete employee document' });
  }
});

/**
 * GET /api/employees/upload-signature
 * Generate a secure signature for client-side Cloudinary uploads
 */
router.get('/upload-signature', (req, res) => {
  try {
    const { public_id, folder } = req.query;

    console.log('📝 [GET /upload-signature] Request received', { public_id, folder });

    if (!public_id || !folder) {
      console.warn('❌ [GET /upload-signature] Missing params');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    console.log('   Env Check:', { 
        hasSecret: !!apiSecret, 
        hasKey: !!apiKey, 
        hasCloud: !!cloudName 
    });

    if (!apiSecret || !apiKey || !cloudName) {
      console.error('❌ [GET /upload-signature] Missing Cloudinary config');
      return res.status(500).json({ error: 'Cloudinary configuration missing on server' });
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
    
    console.log('✅ [GET /upload-signature] Signature generated successfully');

    res.json({
      signature,
      timestamp,
      apiKey,
      cloudName
    });
  } catch (error: any) {
    console.error('❌ [GET /upload-signature] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate upload signature' });
  }
});

/**
 * PATCH /api/employees/:id/photo
 * Update employee profile photo
 */
router.patch('/:id/photo', async (req, res) => {
  const { id } = req.params;
  const sessionUser = req.session.user;
  if (sessionUser!.id !== id && sessionUser!.role !== 'manager' && sessionUser!.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to update this photo' });
  }
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
  const sessionUser = req.session.user;
  if (sessionUser!.id !== id && sessionUser!.role !== 'manager' && sessionUser!.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this photo' });
  }

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
