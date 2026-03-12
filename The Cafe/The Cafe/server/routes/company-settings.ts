/**
 * Company Settings API Routes
 * GET  /api/company-settings       - Get current company settings (any authenticated user)
 * POST /api/company-settings       - Create company settings (admin only, first-time setup)
 * PUT  /api/company-settings/:id   - Update company settings (admin/manager)
 *
 * Philippine payroll compliance fields: TIN, SSS Employer No, PhilHealth No,
 * Pag-IBIG No, BIR RDO, SEC/DTI Registration.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { dbStorage } from '../db-storage';

const router = Router();

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};

// Role check for manager/admin
const requireManagerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  const role = req.session.user.role;
  if (role !== 'manager' && role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Manager or Admin access required' });
  }
  next();
};

/**
 * GET /api/company-settings
 * Returns current company settings. Bank account numbers are masked.
 */
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const settings = await dbStorage.getCompanySettings();
    if (!settings) {
      return res.json({ success: true, settings: null });
    }

    // Mask sensitive bank account number for non-admin users
    const masked = {
      ...settings,
      bankAccountNo: settings.bankAccountNo
        ? '****' + settings.bankAccountNo.slice(-4)
        : null,
    };

    res.json({ success: true, settings: masked });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company settings',
    });
  }
});

/**
 * GET /api/company-settings/full
 * Returns full unmasked company settings (admin only, for editing form)
 */
router.get('/full', requireManagerOrAdmin, async (_req: Request, res: Response) => {
  try {
    const settings = await dbStorage.getCompanySettings();
    res.json({ success: true, settings: settings || null });
  } catch (error) {
    console.error('Error fetching full company settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company settings',
    });
  }
});

/**
 * POST /api/company-settings
 * Create company settings (initial setup)
 */
router.post('/', requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const existing = await dbStorage.getCompanySettings();
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Company settings already exist. Use PUT to update.',
      });
    }

    const {
      name, tradeName, address, city, province, zipCode, country,
      tin, sssEmployerNo, philhealthNo, pagibigNo, birRdo, secRegistration,
      phone, email, website, logoUrl, logoPublicId, industry,
      payrollFrequency, paymentMethod, bankName, bankAccountName, bankAccountNo,
    } = req.body;

    if (!name || !address || !tin) {
      return res.status(400).json({
        success: false,
        error: 'Company name, address, and TIN are required.',
      });
    }

    const settings = await dbStorage.createCompanySettings({
      name, tradeName, address, city, province, zipCode,
      country: country || 'Philippines',
      tin, sssEmployerNo, philhealthNo, pagibigNo, birRdo, secRegistration,
      phone, email, website, logoUrl, logoPublicId,
      industry: industry || 'Food & Beverage',
      payrollFrequency: payrollFrequency || 'semi-monthly',
      paymentMethod: paymentMethod || 'Bank Transfer',
      bankName, bankAccountName, bankAccountNo,
      isActive: true,
      updatedBy: req.session.user!.id,
    });

    res.status(201).json({ success: true, settings });
  } catch (error) {
    console.error('Error creating company settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create company settings',
    });
  }
});

/**
 * PUT /api/company-settings/:id
 * Update company settings
 */
router.put('/:id', requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbStorage.getCompanySettings();
    if (!existing || existing.id !== id) {
      return res.status(404).json({
        success: false,
        error: 'Company settings not found.',
      });
    }

    const {
      name, tradeName, address, city, province, zipCode, country,
      tin, sssEmployerNo, philhealthNo, pagibigNo, birRdo, secRegistration,
      phone, email, website, logoUrl, logoPublicId, industry,
      payrollFrequency, paymentMethod, bankName, bankAccountName, bankAccountNo,
    } = req.body;

    // Only update fields that were provided
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (tradeName !== undefined) updates.tradeName = tradeName;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (province !== undefined) updates.province = province;
    if (zipCode !== undefined) updates.zipCode = zipCode;
    if (country !== undefined) updates.country = country;
    if (tin !== undefined) updates.tin = tin;
    if (sssEmployerNo !== undefined) updates.sssEmployerNo = sssEmployerNo;
    if (philhealthNo !== undefined) updates.philhealthNo = philhealthNo;
    if (pagibigNo !== undefined) updates.pagibigNo = pagibigNo;
    if (birRdo !== undefined) updates.birRdo = birRdo;
    if (secRegistration !== undefined) updates.secRegistration = secRegistration;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (website !== undefined) updates.website = website;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (logoPublicId !== undefined) updates.logoPublicId = logoPublicId;
    if (industry !== undefined) updates.industry = industry;
    if (payrollFrequency !== undefined) updates.payrollFrequency = payrollFrequency;
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (bankName !== undefined) updates.bankName = bankName;
    if (bankAccountName !== undefined) updates.bankAccountName = bankAccountName;
    if (bankAccountNo !== undefined) updates.bankAccountNo = bankAccountNo;
    updates.updatedBy = req.session.user!.id;

    const updated = await dbStorage.updateCompanySettings(id, updates);
    res.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update company settings',
    });
  }
});

export default router;
