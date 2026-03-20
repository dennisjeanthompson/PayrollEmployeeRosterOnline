import { Router } from "express";
import { storage } from "../storage";
import { insertLoanRequestSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Employee: Submit a new loan request
router.post("/", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = insertLoanRequestSchema.parse(req.body);

    // Ensure the employee is submitting for themselves (or checking that they matched)
    if (data.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // DOLE/Fraud Check: Prevent duplicate overlapping loans of the same type.
    // Fetch all user's loans, see if there is an active/pending one of the same type.
    const allUserLoans = await storage.getLoanRequestsByUser(user.id);
    const existingActive = allUserLoans.find(loan => 
      loan.loanType === data.loanType && 
      (loan.status === 'pending' || loan.status === 'approved')
    );

    if (existingActive) {
      return res.status(400).json({ 
        message: `You already have an active or pending ${data.loanType} loan in the system. Please wait for it to be fully settled or rejected before applying again.` 
      });
    }

    const newLoan = await storage.createLoanRequest(data);
    res.status(201).json(newLoan);
  } catch (error) {
    console.error("Error creating loan request:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid loan request data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to submit loan request" });
  }
});

// Employee: Get their own loan history
router.get("/my", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const loans = await storage.getLoanRequestsByUser(user.id);
    res.json(loans);
  } catch (error) {
    console.error("Error fetching user loans:", error);
    res.status(500).json({ message: "Failed to fetch loans" });
  }
});

// Manager/Admin: Get loans for a specific employee
router.get("/user/:userId", async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const loans = await storage.getLoanRequestsByUser(req.params.userId);
    res.json(loans);
  } catch (error) {
    console.error("Error fetching employee loans:", error);
    res.status(500).json({ message: "Failed to fetch employee loans" });
  }
});

// Manager: Get all loans for the branch
router.get("/branch", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ message: "Forbidden" });
    }

    const branchId = user.branchId;
    const loans = await storage.getLoanRequestsByBranch(branchId);
    
    // Enrich with user details
    const users = await storage.getAllUsers();
    const enrichedLoans = loans.map(loan => {
      const employee = users.find(u => u.id === loan.userId);
      return {
        ...loan,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
      };
    });

    res.json(enrichedLoans);
  } catch (error) {
    console.error("Error fetching branch loans:", error);
    res.status(500).json({ message: "Failed to fetch branch loans" });
  }
});

// Manager: Approve or Reject a loan
router.put("/:id", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const { status, hrApprovalNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    if (status === 'rejected' && (!hrApprovalNote || hrApprovalNote.trim() === '')) {
      return res.status(400).json({ message: "A reason (Note) is required when rejecting a loan." });
    }

    const existingLoan = await storage.getLoanRequest(id);
    if (!existingLoan) {
      return res.status(404).json({ message: "Loan request not found" });
    }

    // Verify branch authorization
    if (existingLoan.branchId !== user.branchId && user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Loan belongs to another branch" });
    }

    const updated = await storage.updateLoanRequest(id, status, hrApprovalNote, user.id);
    res.json(updated);
  } catch (error) {
    console.error("Error updating loan status:", error);
    res.status(500).json({ message: "Failed to update loan status" });
  }
});

export default router;
