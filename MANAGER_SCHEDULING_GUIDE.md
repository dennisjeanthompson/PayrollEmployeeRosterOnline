# Manager/Admin Scheduling System - Complete Technical Guide

## 🎯 Overview

The scheduling system is **manager-exclusive** with role-based access control. Managers can:
- ✅ Create new shifts for employees
- ✅ Drag-drop shifts to reschedule them
- ✅ Edit shift times manually
- ✅ Delete shifts
- ✅ Create multiple shifts per employee per day (if no overlap)

**Duplicate shifts ON SAME DAY are ALLOWED** as long as times don't overlap.

---

## 📋 TABLE OF CONTENTS

1. [Access Control](#access-control)
2. [Manager Interface](#manager-interface)
3. [How to Create Shifts](#how-to-create-shifts)
4. [How Drag-Drop Works](#how-drag-drop-works)
5. [How to Edit Shifts](#how-to-edit-shifts)
6. [How to Delete Shifts](#how-to-delete-shifts)
7. [Duplicate Shifts Policy](#duplicate-shifts-policy)
8. [Real-Time Synchronization](#real-time-synchronization)
9. [Validation Rules](#validation-rules)
10. [Error Handling](#error-handling)
11. [Holiday Calendar Integration](#holiday-calendar-integration)

---

## 🔐 Access Control

### Who Can Access the Schedule?

**At the page level:**
```typescript
// client/src/pages/mui-schedule.tsx - Line 87
const isManagerRole = isManager();

// Only shows schedule if manager
{!isLoading && !isError && viewMode === 'schedule' && (
  <ResourceTimelineScheduler
    shifts={shifts}
    employees={employees}
    weekStart={weekStart}
    isManager={isManagerRole}
  />
)}
```

**At the server level:**
```typescript
// server/routes.ts - Line 539
app.put("/api/shifts/:id", requireAuth, requireRole(["manager"]), ...)
app.post("/api/shifts", requireAuth, requireRole(["manager"]), ...)
app.delete("/api/shifts/:id", requireAuth, requireRole(["manager"]), ...)
```

### Key Points:
- ✅ Managers can see and edit shifts
- ✅ All mutations require `requireRole(["manager"])` middleware
- ✅ Server validates role on EVERY request
- ✅ Client-side checks are UX only (server is source of truth)

---

## 🖥️ Manager Interface

### Schedule Page Layout
```
┌─────────────────────────────────────────────┐
│         SCHEDULE (Manager View)             │
│  [Add Shift] [Refresh]                      │
├─────────────────────────────────────────────┤
│ ◄ Today ► │ Nov 3 - Nov 9, 2025 │ [Schedule] [Month] │
├─────────────────────────────────────────────┤
│
│ STAFF          │ SUN Nov 3 │ MON Nov 4 │ ... (7 days)
│ John Barista   │  [6-2 AM] │  [2-10PM] │
│ Sarah Cook     │  [10-6PM] │ [6-2 AM]  │
│ Mike Manager   │           │  [2-10PM] │
│
└─────────────────────────────────────────────┘
```

### Controls Available to Managers:

1. **"Add Shift" Button** - Opens create dialog
2. **Drag Shift Cards** - Reschedule to new time/employee
3. **Edit Icon** (✏️) - Open edit drawer to change times
4. **Delete Icon** (🗑️) - Remove shift with confirmation
5. **View Toggle** - Switch between "Schedule" (weekly) and "Month" views
6. **Navigation** - Previous/Next week or month, Jump to Today

---

## ✨ How to Create Shifts

### Step 1: Open Create Dialog
```typescript
// Button click triggers dialog
<Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={() => setCreateDialogOpen(true)}
>
  Add Shift
</Button>
```

### Step 2: Fill Out Shift Form
Manager enters:
1. **Employee** - Dropdown of all active employees
2. **Dates** - Toggle multiple days (week grid)
3. **Time Preset or Custom Time** - Morning (6-2), Afternoon (2-10), Night (10-6), or custom
4. **Notes** (optional) - Additional info

### Step 3: Client-Side Validation
```typescript
// client/src/pages/mui-schedule.tsx - Line 247-260
const overlappingShifts = shifts.filter(shift => {
  if (shift.userId !== data.userId) return false;
  const shiftStart = parseISO(shift.startTime);
  const shiftEnd = parseISO(shift.endTime);
  // ✅ Allows multiple shifts PER DAY if times don't overlap
  // ❌ Blocks if times conflict with existing shift
  return startDateTime < shiftEnd && endDateTime > shiftStart;
});

if (overlappingShifts.length > 0) {
  throw new Error(`Time conflict! Employee already has a shift from ${start} to ${end}.`);
}
```

### Step 4: Server Validation
```typescript
// server/routes.ts - Line 506-520
// Validate shift times (end > start)
const timeError = validateShiftTimes(shiftData.startTime, shiftData.endTime);
if (timeError) return res.status(400).json({ message: timeError });

// Check for overlapping shifts (TIME-BASED ONLY)
const overlappingShift = await storage.checkShiftOverlap(
  shiftData.userId,
  new Date(shiftData.startTime),
  new Date(shiftData.endTime)
);

if (overlappingShift) {
  // ❌ Return 409 if times overlap
  return res.status(409).json({
    message: `Employee already has a shift scheduled from ${existingStart} to ${existingEnd}...`,
    code: 'SHIFT_CONFLICT',
    conflictingShift: overlappingShift
  });
}

// ✅ Create shift
const shift = await storage.createShift(shiftData);
res.json({ shift });
```

### Step 5: Real-Time Update
```typescript
onSuccess: () => {
  // Invalidate cached queries
  queryClient.invalidateQueries({ queryKey: ["shifts"] });
  
  // Close dialog and reset form
  setCreateDialogOpen(false);
  setFormData({ ... }); // reset
  setSelectedDates(new Set()); // clear selections
}
```

### Example Workflow

**Manager wants to create shifts for John (barista):**

```
1. Click "Add Shift" button
2. Select "John Doe" from employee dropdown
3. Click dates: Mon, Tue, Wed (multi-select)
4. Click "Afternoon" preset (2 PM - 10 PM)
5. Add note: "Cover for absent staff"
6. Click "Create"
7. System creates 3 shifts:
   - John: Mon 2-10 PM ✅
   - John: Tue 2-10 PM ✅
   - John: Wed 2-10 PM ✅
8. Grid updates instantly (5-second polling)
```

---

## 🎯 How Drag-Drop Works

### The Complete Drag-Drop Flow

#### 1. User Initiates Drag
```typescript
// client/src/components/schedule/resource-timeline-scheduler.tsx - Line 216
const handleDragStart = (shift: Shift, employeeId: string) => {
  if (!isManager) return; // Only managers can drag
  
  setDraggedShift(shift);
  const startHour = parseISO(shift.startTime).getHours();
  setDragSource({ employeeId, hour: startHour });
};
```

**Card Changes:**
- Cursor changes from `grab` to `grabbing`
- Card opacity becomes 50% (visual feedback)
- Start hour is stored for validation

#### 2. User Hovers Over Target Cell
```typescript
// Line 226
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // Allow drop
  e.dataTransfer.dropEffect = "move"; // Shows move cursor
};
```

**Visual Feedback:**
- Target cell highlights as drop zone
- Cursor shows "move" icon

#### 3. User Releases Mouse (THE MAGIC HAPPENS)
```typescript
// Line 231-260 - THE KEY DROP CALCULATION
onDrop={(e: React.DragEvent) => {
  // Get pixel position where user released mouse
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const dropY = e.clientY - rect.top; // Pixels from cell top (0-100)
  const cellHeight = rect.height;    // Total cell height
  
  // Convert pixel position to hour slot
  // Formula: (dropY / cellHeight) * 17 + 6
  // - 17 = hours available (6 AM to 10 PM)
  // - 6 = starting hour (6 AM)
  // - dropY / cellHeight = percentage down (0.0 to 1.0)
  
  const hourSlot = Math.floor((dropY / cellHeight) * 17) + 6;
  const hour = Math.min(Math.max(hourSlot, 6), 22); // Constrain to 6-22
  
  // Example calculations:
  // Drop at 0% (top)     → hour ≈ 6   (6 AM)
  // Drop at 50% (middle) → hour ≈ 14  (2 PM)
  // Drop at 100% (bottom)→ hour ≈ 22  (10 PM)
  
  handleDrop(employee.id, dayIdx, hour);
}}
```

### Detailed Position Calculation Example

**Scenario:** Manager drags John's shift from Monday morning to Wednesday afternoon

```
User drops at Wednesday, 3 PM position
Cell height: 100 pixels
dropY (mouse from cell top): 50 pixels (middle of cell)

Calculation:
  hourSlot = floor((50 / 100) * 17) + 6
  hourSlot = floor(0.5 * 17) + 6
  hourSlot = floor(8.5) + 6
  hourSlot = 8 + 6
  hourSlot = 14 (2 PM in 24-hour format)
  
But wait... user dropped at 3 PM, not 2 PM!
This is because the cell represents a full day (6 AM - 10 PM = 17 hours)
So 50% down = 8.5 hours into the day = 2:30 PM (rounded down to 2 PM)
```

### 4. Calculate New Shift Times
```typescript
// Preserve original shift duration
const oldStart = parseISO(shift.startTime);
const oldEnd = parseISO(shift.endTime);
const duration = oldEnd.getTime() - oldStart.getTime(); // e.g., 8 hours

// Create new start with dropped hour
const newStart = new Date(weekDays[dayIdx]); // Target day
newStart.setHours(hour, 0, 0, 0);           // Target hour

// Add duration to get new end
const newEnd = new Date(newStart.getTime() + duration);

// Example:
// Original: Mon 6 AM - 2 PM (8 hours)
// Dropped on: Wed 2 PM
// Result: Wed 2 PM - 10 PM (8 hours preserved)
```

### 5. Send to Server
```typescript
updateShiftMutation.mutate({
  shiftId: shift.id,
  newStartTime: newStart.toISOString(), // "2025-11-05T14:00:00.000Z"
  newEndTime: newEnd.toISOString(),     // "2025-11-05T22:00:00.000Z"
});
```

### 6. Server Validates Update
```typescript
// server/routes.ts - Line 539-573
app.put("/api/shifts/:id", requireAuth, requireRole(["manager"]), async (req, res) => {
  const { id } = req.params;
  const updateData = insertShiftSchema.partial().parse(req.body);
  
  // Get existing shift
  const existingShift = await storage.getShift(id);
  
  // Determine new times
  const newStartTime = updateData.startTime ? new Date(updateData.startTime) : existing...;
  const newEndTime = updateData.endTime ? new Date(updateData.endTime) : existing...;
  
  // Validate times are logical (end > start)
  const timeError = validateShiftTimes(...);
  if (timeError) return res.status(400).json({ message: timeError });
  
  // Check for overlaps (TIME-BASED, not date-based)
  const overlappingShift = await storage.checkShiftOverlap(
    newUserId,
    newStartTime,
    newEndTime,
    id  // Exclude current shift from check
  );
  
  if (overlappingShift) {
    return res.status(409).json({
      message: `Employee already has a shift scheduled from ... to ...`,
      code: 'SHIFT_CONFLICT',
      conflictingShift: overlappingShift
    });
  }
  
  // ✅ Update in database
  const shift = await storage.updateShift(id, updateData);
  res.json({ shift });
});
```

### 7. Client Updates UI
```typescript
// Upon successful update:
queryClient.invalidateQueries({ queryKey: ["shifts"] });
// Triggers immediate refetch of all shifts
// Grid re-renders with shift in new position

// Show confirmation
setDraggedShift(null);
setDragSource(null);
// Card returns to full opacity, cursor back to normal
```

### Drag-Drop Summary

| Step | What Happens | Code Location |
|------|--------------|---------------|
| 1. User clicks shift | Card stored, opacity 50% | `handleDragStart()` L216 |
| 2. User hovers target | Cell highlights | `handleDragOver()` L226 |
| 3. User releases mouse | **Position calculated** | `onDrop()` L231-260 |
| 4. Calculate new times | Duration preserved | `handleDrop()` |
| 5. Send to server | PUT request sent | `updateShiftMutation` |
| 6. Server validates | Check overlaps, save | `routes.ts` L539 |
| 7. UI updates | Grid refreshes, card moves | Query invalidation |

---

## ✏️ How to Edit Shifts

### Option 1: Quick Edit with Drawer

**Click Edit Icon (✏️) on shift card**

```typescript
// Click handler
handleEditClick = (shift: Shift) => {
  setShiftToEdit(shift);
  setEditStartTime(format(parseISO(shift.startTime), 'HH:mm'));
  setEditEndTime(format(parseISO(shift.endTime), 'HH:mm'));
  setEditDrawerOpen(true); // Opens right sidebar
};
```

**Edit Drawer UI:**
```
┌──────────────────────────────┐
│ Edit Shift              [✕]  │
├──────────────────────────────┤
│ John Doe (Barista)           │
│                              │
│ Start Time: [14:00] (2:00 PM)│
│ End Time:   [22:00] (10:00PM)│
│                              │
│ ⓘ If end time is before     │
│   start time, the shift will │
│   continue to the next day.  │
│                              │
│ [Cancel] [Save Changes]      │
└──────────────────────────────┘
```

**Edit Form Submission:**
```typescript
// handleSaveEdit() - Line 178-204
const handleSaveEdit = () => {
  if (!shiftToEdit) return;
  
  // Parse time inputs (e.g., "14:00")
  const [startHour, startMin] = editStartTime.split(':').map(Number);
  const [endHour, endMin] = editEndTime.split(':').map(Number);
  
  // Create dates with target day
  const startDate = parseISO(shiftToEdit.startTime).toDateString();
  const newStart = new Date(startDate);
  newStart.setHours(startHour, startMin, 0, 0);
  
  const newEnd = new Date(startDate);
  newEnd.setHours(endHour, endMin, 0, 0);
  
  // Handle night shifts (10 PM - 6 AM)
  if (newEnd <= newStart) {
    newEnd.setDate(newEnd.getDate() + 1); // Add 1 day
  }
  
  // Send update
  updateShiftMutation.mutate({
    shiftId: shiftToEdit.id,
    newStartTime: newStart.toISOString(),
    newEndTime: newEnd.toISOString(),
  });
};
```

### Option 2: Drag to New Time

You can also drag the same shift to a different TIME within the same employee's cell:

```typescript
// Drop handler calculates hour from mouse position
const hour = Math.floor((dropY / cellHeight) * 17) + 6;

// Same time calculation as create flow
updateShiftMutation.mutate({
  shiftId: shift.id,
  newStartTime: newStart.toISOString(),
  newEndTime: newEnd.toISOString(),
});
```

### Validation During Edit

**Client-side (UX feedback):**
- Auto-calculates if start > end (night shift handling)
- Shows "Shift continues to next day" alert

**Server-side (Source of truth):**
```typescript
// Validates same as drag-drop
1. Times are logical (end > start) ✓
2. No overlap with other shifts ✓
3. Returns 409 if conflict found ✓
```

### Example Edit Workflow

```
Manager edits John's shift:
- Original: Mon 2 PM - 10 PM
- Manager changes start to 3 PM
- Server validates:
  ✓ 3 PM < 10 PM (valid)
  ✓ No conflict with other shifts
  ✅ Update saved
- Result: Mon 3 PM - 10 PM

Another example (night shift):
- Manager enters: 11 PM start, 6 AM end
- System detects: 6 AM is before 11 PM
- Auto-adds 1 day to end
- Result: Mon 11 PM - Tue 6 AM ✓
```

---

## 🗑️ How to Delete Shifts

### Step 1: Click Delete Icon (🗑️)
```typescript
const handleDeleteClick = (shift: Shift) => {
  setShiftToDelete(shift);
  setDeleteConfirmOpen(true);
};
```

### Step 2: Confirmation Dialog Appears
```
┌──────────────────────────────────┐
│ Delete Shift?                    │
├──────────────────────────────────┤
│ Are you sure you want to delete  │
│ this shift?                      │
│                                  │
│ Employee: John Doe               │
│ Role: Barista                    │
│ Time: Nov 5, 2:00 PM - 10:00 PM │
│                                  │
│ [Cancel] [Delete]                │
└──────────────────────────────────┘
```

### Step 3: Server Deletes
```typescript
// server/routes.ts - Line 598-617
app.delete("/api/shifts/:id", requireAuth, requireRole(["manager"]), async (req, res) => {
  const { id } = req.params;
  
  // Get shift to verify it exists
  const shift = await storage.getShift(id);
  if (!shift) return res.status(404).json({ message: "Shift not found" });
  
  // Verify shift belongs to manager's branch
  if (shift.branchId !== req.user!.branchId) {
    return res.status(403).json({ message: "Cannot delete shift from another branch" });
  }
  
  // ✅ Delete shift
  const result = await storage.deleteShift(id);
  
  res.json({ 
    message: "Shift deleted successfully", 
    shiftId: id 
  });
});
```

### Step 4: UI Updates
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["shifts"] });
  setDeleteDialogOpen(false);
  setShiftToDelete(null);
  // Grid refreshes, shift disappears
};
```

---

## 👥 Duplicate Shifts Policy

### ALLOWED: Multiple Shifts Per Day (No Overlap)

**Manager creates:**
- Employee: John
- Date: Monday
- Times: 6 AM - 2 PM ✅
- AND: 2 PM - 10 PM ✅
- AND: 10 PM - 6 AM ✅

**Result:** All 3 shifts scheduled because times don't overlap

```
Monday:
  6 AM │██ John (6-2)
  2 PM │██ John (2-10)
 10 PM │██ John (10-6)
```

### NOT ALLOWED: Overlapping Times

**Manager tries to create:**
- Employee: John
- Existing: Mon 2 PM - 10 PM
- New: Mon 1 PM - 9 PM ❌

**Result:** Server returns 409 Conflict
```
Error: "Employee already has a shift scheduled from 2:00 PM to 10:00 PM. 
        Please choose a different time."
```

**Why?** Times overlap:
```
Existing: ════════════ (2 PM - 10 PM)
New:    ════════════   (1 PM - 9 PM)
Overlap:    ██████     (2 PM - 9 PM) ❌
```

### Validation Code

```typescript
// client/src/pages/mui-schedule.tsx - Line 247-260
const overlappingShifts = shifts.filter(shift => {
  if (shift.userId !== data.userId) return false; // Different employee, ok
  
  const shiftStart = parseISO(shift.startTime);
  const shiftEnd = parseISO(shift.endTime);
  
  // TIME-BASED check, NOT date-based
  // Returns true if times overlap
  return startDateTime < shiftEnd && endDateTime > shiftStart;
});

if (overlappingShifts.length > 0) {
  throw new Error(`Time conflict!...`);
}

// Key insight: date is completely ignored!
// Only times matter for validation
```

### What Changed: No More Date Restriction

**Before (Commit 805bda4):**
```typescript
// ❌ REMOVED - This was blocking multiple shifts per day
const shiftsOnDate = shifts.filter(shift => 
  isSameDay(parseISO(shift.startTime), date)
);
if (shiftsOnDate.length > 0) {
  throw new Error("Only one shift per day");
}
```

**After (Current):**
```typescript
// ✅ KEPT - Only checks if times overlap
const overlappingShifts = shifts.filter(shift => {
  if (shift.userId !== data.userId) return false;
  return startDateTime < shiftEnd && endDateTime > shiftStart;
});
```

---

## 🔄 Real-Time Synchronization

### How It Works

The system uses **polling** to keep data fresh. Every 5 seconds, the client auto-fetches shifts and employees.

```typescript
// client/src/pages/mui-schedule.tsx - Line 156-180
const { data: shiftsData } = useQuery({
  queryKey: ["shifts", dateRange.start.toISOString(), dateRange.end.toISOString()],
  queryFn: async () => {
    const endpoint = isManagerRole
      ? `/api/shifts/branch?startDate=...&endDate=...`
      : `/api/shifts?startDate=...&endDate=...`;
    const response = await apiRequest("GET", endpoint);
    return response.json();
  },
  refetchInterval: 5000,                    // Poll every 5 seconds
  refetchOnWindowFocus: true,               // Refresh when tab regains focus
  refetchIntervalInBackground: true,        // Keep polling even if unfocused
  retry: (failureCount, error: any) => {
    if (error?.status === 401) return false; // Don't retry auth errors
    return failureCount < 3;                 // Retry other errors
  },
});
```

### Timeline of a Drag Operation with Real-Time

```
Manager A           Server              Manager B
  │                  │                     │
  ├─ Drag shift ────→ PUT /api/shifts/1   │
  │                  │                     │
  │                ✅ Update DB            │
  │                  │                     │
  │                ✅ Return 200 OK        │
  │                  │                     │
  │   Invalidate ←───┤                     │
  │   queries        │                     │
  │                  │                     │
  │ 5-sec later      │  5-sec later        │
  ├─ Polling ───────→ GET /api/shifts    ←─┤ Polling
  ├─ Refetch ←───────┤  (fetches latest)  ├─ Refetch
  │  Render new ←────┤                     │  Render new
  │  position        │                     │  position
  │                  │                     │
```

### Key Points

- **Immediate for creator:** On success, `queryClient.invalidateQueries()` triggers instant refetch
- **Within 5 seconds for others:** Other managers see the change at next polling interval
- **Background polling:** Works even if manager switches tabs
- **No WebSocket:** Simple HTTP polling (easier to scale, stateless)

---

## ✅ Validation Rules

### Server-Side Validation (Authoritative)

| Rule | Code | Behavior |
|------|------|----------|
| **Authentication** | `requireAuth` | Must have valid session, 401 if not |
| **Authorization** | `requireRole(["manager"])` | Must be manager role, 403 if not |
| **Times Valid** | `validateShiftTimes()` | end > start, 400 if not |
| **No Time Overlap** | `checkShiftOverlap()` | Can't overlap with existing shift, 409 if conflict |
| **Branch Ownership** | `shift.branchId === req.user.branchId` | Can only delete own branch shifts, 403 if not |

### Client-Side Validation (UX Only)

| Rule | Code | Behavior |
|------|------|----------|
| **Time Overlap** | Filter overlapping shifts | Show error before sending |
| **Manager Check** | `if (!isManager) return;` | Disable drag-drop buttons if not manager |
| **Required Fields** | Check userId, selectedDates | Disable submit if missing |
| **Night Shift Logic** | `if (newEnd <= newStart) add 1 day` | Handle 10 PM - 6 AM correctly |

### Validation Flow - Create Shift

```
User clicks "Create"
  ↓
CLIENT: Check overlaps with existing shifts
  → If conflict, show error, STOP
  ↓
CLIENT: Check required fields (employee, date, time)
  → If missing, show error, STOP
  ↓
SERVER (POST /api/shifts): Receive data
  → Validate times (end > start)
  → Check overlaps again (time-based)
  → Check auth & role
  ↓
If all pass: ✅ Create shift
If any fail: ❌ Return error code (400, 403, 409)
  ↓
CLIENT: On success
  → Invalidate queries
  → Close dialog
  → Show success (implicit via grid update)
```

---

## ⚠️ Error Handling

### Error Types and Responses

#### 1. **409 Conflict - Time Overlap**
```
Request: Create shift Mon 2-10 PM for John
Existing: John has Mon 1-9 PM
Response: 409 Conflict
Message: "Employee already has a shift scheduled from 
          1:00 PM to 9:00 PM. Please choose a different time."
```

**User sees:** Error message in dialog, shift not created

#### 2. **400 Bad Request - Invalid Data**
```
Request: Create shift with endTime before startTime
Response: 400 Bad Request
Message: "Invalid shift data" or specific validation error
```

**User sees:** Error message, form not submitted

#### 3. **401 Unauthorized - Not Logged In**
```
Request: Any mutation without session
Response: 401 Unauthorized
Message: "Not authenticated"
```

**Trigger:** Session expired, user redirected to login

#### 4. **403 Forbidden - Not Manager**
```
Request: PUT /api/shifts/1 as non-manager user
Response: 403 Forbidden
Message: "Insufficient permissions"
```

**Trigger:** Client-side check prevents this, but server enforces

#### 5. **404 Not Found - Shift Doesn't Exist**
```
Request: DELETE /api/shifts/invalid-id
Response: 404 Not Found
Message: "Shift not found"
```

**User sees:** "Failed to delete shift" (generic message)

### Error Handling Code

**Client side:**
```typescript
const createShiftMutation = useMutation({
  mutationFn: async (data: typeof formData) => {
    // ... validation ...
    const response = await apiRequest("POST", "/api/shifts", {
      userId: data.userId,
      branchId: currentUser?.branchId,
      position: data.position || "Staff",
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: "scheduled",
      notes: data.notes || undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create shift");
    }
    
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
    setCreateDialogOpen(false);
    setCreateError(null); // Clear any previous errors
  },
  onError: (error: Error) => {
    setCreateError(error.message); // Show error in dialog
  },
});
```

---

## 🔍 Technical Deep Dive

### Database Schema (What Gets Stored)

```typescript
interface Shift {
  id: string;              // UUID
  userId: string;          // Which employee
  branchId: string;        // Which branch
  startTime: Date;         // Full datetime (ISO string)
  endTime: Date;           // Full datetime (ISO string)
  status: string;          // "scheduled", "completed", etc.
  date: string;            // Extracted from startTime (YYYY-MM-DD)
  notes?: string;          // Optional manager notes
  user?: {                 // Populated on fetch
    firstName: string;
    lastName: string;
    role?: string;
  };
}
```

### API Endpoints

#### Create Shift
```
POST /api/shifts
Authorization: requireAuth, requireRole(["manager"])
Body: {
  userId: string,
  branchId: string,
  position: string,
  startTime: string (ISO),
  endTime: string (ISO),
  status: string,
  notes?: string
}
Response: { shift: Shift }
Errors: 400 (invalid), 409 (conflict)
```

#### Update Shift
```
PUT /api/shifts/:id
Authorization: requireAuth, requireRole(["manager"])
Body: {
  startTime?: string (ISO),
  endTime?: string (ISO),
  userId?: string,
  status?: string,
  notes?: string
}
Response: { shift: Shift }
Errors: 400 (invalid), 404 (not found), 409 (conflict)
```

#### Delete Shift
```
DELETE /api/shifts/:id
Authorization: requireAuth, requireRole(["manager"])
Response: { message: "Shift deleted successfully", shiftId: string }
Errors: 403 (not own branch), 404 (not found)
```

#### List Shifts
```
GET /api/shifts/branch?startDate=X&endDate=Y
Authorization: requireAuth, requireRole(["manager"])
Response: { shifts: Shift[] }

GET /api/shifts?startDate=X&endDate=Y&userId=Z
Authorization: requireAuth
Response: { shifts: Shift[] }
```

---

## 📊 Complete Workflow Example

### Scenario: Schedule Christmas Eve Coverage

**Manager:** Lisa (Store Manager)
**Employees:** John (Barista), Sarah (Cook), Mike (Manager)
**Goal:** Create full day schedule for Dec 24, 2025

#### Step 1: Open Schedule
```
Click "Schedule" in navigation
→ Page loads shifts for current week
→ Lisa sees "Add Shift" button (visible because she's manager)
```

#### Step 2: Create First Shift
```
Click "Add Shift"
→ Dialog opens

Fill form:
- Employee: John Doe
- Dates: Check Dec 24 only
- Time Preset: Morning (6 AM - 2 PM)
- Notes: "Regular shift"

Click "Create"
→ Client validates: No overlaps with John's shifts on Dec 24 ✓
→ Server validates: 
    - John's role is barista ✓
    - 2 PM > 6 AM ✓
    - No shift 6-2 PM for John ✓
→ Shift created ✅
→ Dialog closes, grid shows new shift

Grid now shows:
Dec 24 │ John [6-2 AM] │
```

#### Step 3: Create Second Shift (Same Day, Different Time)
```
Click "Add Shift" again
→ Dialog opens

Fill form:
- Employee: Sarah Cook
- Dates: Check Dec 24 only
- Time Preset: Afternoon (2 PM - 10 PM)
- Notes: "Holiday coverage"

Click "Create"
→ Client validates: Sarah has no 2-10 PM shift on Dec 24 ✓
→ Server validates: All checks pass ✓
→ Shift created ✅

Grid now shows:
Dec 24 │ John [6-2 AM]   │
Dec 24 │ Sarah [2-10 PM] │
```

#### Step 4: Create Overnight Shift
```
Click "Add Shift"

Fill form:
- Employee: Mike Manager
- Dates: Check Dec 24 only
- Time Preset: Night (10 PM - 6 AM)
- Notes: "Closing shift, opens next day"

Click "Create"
→ Client detects: 6 AM < 10 PM, so adds 1 day
→ Shift stored as: Dec 24 10 PM - Dec 25 6 AM ✓

Grid now shows (Dec 24):
John  [6-2 AM]   │
Sarah [2-10 PM]  │
Mike  [10 PM-6AM]│ (continues to Dec 25)
```

#### Step 5: Realize John Needs 2 PM Start (Drag It)
```
Manager realizes John isn't available 6-8 AM
Drag John's shift card to 2 PM slot

Mouse move sequence:
1. Cursor on John's card → changes to "grab"
2. Click John's card → becomes 50% opacity
3. Drag to Wednesday, 2 PM area → cell highlights
4. Release mouse → calculation happens:
   - dropY = mouse Y - cell top = 200px (approx)
   - cellHeight = 400px
   - hourSlot = floor((200/400) * 17) + 6 = floor(8.5) + 6 = 14
   - hour = 14 (2 PM) ✓
5. New shift: Jan 1 2 PM - 10 PM (8 hours preserved) ✅

Server:
- Validates: John has no 2-10 PM shift ✓
- Validates: 10 PM > 2 PM ✓
- Updates database
- Returns 200 OK

Client:
- Invalidates queries
- Refetches shifts
- Grid re-renders
- John's shift now shows 2-10 PM instead of 6-2 AM ✅
```

#### Step 6: Edit Sarah's End Time
```
Manager realizes Sarah needs to leave at 8 PM (not 10 PM)
Click Edit (✏️) on Sarah's shift

Edit drawer opens:
- Start Time: 14:00 (2 PM) ✓ (can't change in this UI)
- End Time: 22:00 (10 PM) → changed to 20:00 (8 PM)

Click "Save Changes"
→ Server validates: Sarah has no 2-8 PM shift ✓
→ Sarah's shift updated: 2 PM - 8 PM
→ Grid shows: Sarah [2-8 PM] instead of [2-10 PM]
```

#### Step 7: Delete Mike's Shift
```
Manager decides Mike doesn't need to close tonight
Click Delete (🗑️) on Mike's shift

Confirmation dialog:
"Are you sure you want to delete this shift?
 Employee: Mike Manager
 Role: Manager
 Time: Dec 24, 10:00 PM - Dec 25, 6:00 AM"

Click "Delete"
→ Server deletes shift
→ Grid removes Mike's card
→ Dec 24 now shows: John [2-10 PM], Sarah [2-8 PM]
```

#### Step 8: View Coverage
```
Final schedule for Dec 24:
John  (Barista) │ [2-10 PM] ✓
Sarah (Cook)    │ [2-8 PM]  ✓
(No one 6 AM-2 PM, no overnight)

Manager gets notification (5-second polling):
Same schedule is now live and visible to employees
Employees can view shifts in their own calendar
```

---

## 🎓 Summary

### What Managers Can Do

✅ **Create** shifts with multiple dates at once
✅ **Drag** shifts to new times (precise mouse position calculation)
✅ **Edit** shift times in drawer (handles night shifts automatically)
✅ **Delete** shifts with confirmation
✅ **Multiple shifts per day** for same employee (if no time overlap)
✅ **Real-time sync** - see others' changes within 5 seconds

### Validation Safeguards

✅ **Client-side** - Instant feedback before sending request
✅ **Server-side** - Authoritative validation
✅ **Database** - Final constraint checks
✅ **Role-based** - Only managers can modify shifts

### Key Insights

1. **Duplicates Allowed:** Multiple shifts per day are OK if times don't overlap
2. **Position-Based Drag:** Uses mouse Y coordinate, not predefined hours
3. **Duration Preserved:** Dragging keeps original shift length
4. **Night Shift Smart:** Auto-adds day if end < start
5. **5-Second Polling:** Keeps all managers in sync
6. **No Hardcoding:** All times calculated from data

---

## 📅 Holiday Calendar Integration

### Overview
The system now includes a dedicated Holiday Calendar specific to Philippine Labor Standards (DOLE). This ensures accurate premium pay calculations and allows managers to control work availability on specific holidays.

### Managing Holidays
**Access:** "Holidays" tab in sidebar (Manager/Admin only).

**Features:**
- **View:** Monthly calendar showing all holidays.
- **Seed:** One-click import of 2025 standard holidays (Proclamation 727).
- **Create/Edit:** Custom holidays with specific types:
  - 🔴 **Regular Holiday** (Double Pay / 200%)
  - 🟠 **Special Non-Working** (30% Premium / 130%)
  - 🔵 **Company/Special Working** (Standard Pay, treated as normal work day)

### Scheduling Restrictions
ADMINs can toggle **"Work Allowed"** for each holiday:
- **ON (Default):** Shifts allowed. Payroll automatically applies premium rates.
- **OFF:** Shifts BLOCKED. Managers cannot drag/create shifts on this date.
  - *Error:* "Cannot schedule shifts on [Holiday Name] - work not allowed."

### Visual Indicators on Schedule
- **Background Color:** Holidays appear as colored vertical columns on the schedule grid.
- **Tooltip:** Hovering over the date header shows the holiday name and pay rule.

---

## 🚀 Ready to Deploy

The scheduling system is **production-ready** with:
- ✅ Comprehensive validation (client + server)
- ✅ Real-time synchronization
- ✅ Role-based access control
- ✅ Intuitive drag-drop UI
- ✅ Error handling and recovery
- ✅ Mobile-responsive design

Deploy with confidence! 🎉
