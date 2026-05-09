import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { dbStorage } from "../db-storage";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  (req as any).user = req.session.user;
  next();
};

const requireManagerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (role !== "manager" && role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (role !== "admin") {
    return res.status(403).json({ message: "Admin permissions required" });
  }
  next();
};

export function registerBranchesRoutes(router: Router) {
  // Get all branches with pagination and search
  router.get("/api/branches", requireAuth, async (req: Request, res: Response) => {
    try {
      const allBranches = await dbStorage.getAllBranches();
      res.json({ branches: allBranches });
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // Get a single branch by ID
  router.get("/api/branches/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const branch = await dbStorage.getBranch(id);
      
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      res.json(branch);
    } catch (error) {
      console.error("Error fetching branch:", error);
      res.status(500).json({ message: "Failed to fetch branch" });
    }
  });

  // Create a new branch
  router.post("/api/branches", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      console.log('Received request body:', req.body);
      
      const schema = z.object({
        name: z.string().min(1, "Name is required"),
        address: z.string().min(1, "Address is required"),
        phone: z.string().optional(),
        isActive: z.boolean().default(true),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        console.log('Validation error:', result.error);
        return res.status(400).json({
          message: "Validation error",
          errors: result.error.flatten().fieldErrors,
        });
      }

      const newBranch = await dbStorage.createBranch({
        name: result.data.name,
        address: result.data.address,
        phone: result.data.phone,
        isActive: result.data.isActive,
      });

      console.log('Branch created:', newBranch);
      res.status(201).json(newBranch);
    } catch (error) {
      console.error("Error creating branch:", error);
      res.status(500).json({ 
        message: "Failed to create branch",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update a branch (supports both PUT and PATCH)
  const handleUpdate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Managers can only modify their own branch
      if ((req as any).user?.role === 'manager' && (req as any).user?.branchId !== id) {
        return res.status(403).json({ message: "Managers can only modify their own branch" });
      }

      const schema = z.object({
        name: z.string().min(1, "Name is required").optional(),
        address: z.string().min(1, "Address is required").optional(),
        phone: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: result.error.flatten().fieldErrors,
        });
      }

      const updatedBranch = await dbStorage.updateBranch(id, result.data);

      if (!updatedBranch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      res.json(updatedBranch);
    } catch (error) {
      console.error("Error updating branch:", error);
      res.status(500).json({ message: "Failed to update branch" });
    }
  };

  router.put("/api/branches/:id", requireAuth, requireManagerOrAdmin, handleUpdate);
  router.patch("/api/branches/:id", requireAuth, requireManagerOrAdmin, handleUpdate);

  // Delete a branch (soft delete by setting isActive to false)
  router.delete("/api/branches/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const updatedBranch = await dbStorage.updateBranch(id, { isActive: false });

      if (!updatedBranch) {
        return res.status(404).json({ message: "Active branch not found" });
      }

      res.json({ message: "Branch deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating branch:", error);
      res.status(500).json({ message: "Failed to deactivate branch" });
    }
  });
}
