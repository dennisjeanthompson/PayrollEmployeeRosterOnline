const fs = require('fs');
const filePath = 'client/src/pages/schedule-v2.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the shifts query (lines 261-268)
const oldPattern = /\/\/ .+ DATA QUERIES .+\r?\n  const \{ data: shiftsData, isLoading: shiftsLoading \} = useQuery<\{ shifts: Shift\[\] \}>\(\{\r?\n    queryKey: \['shifts', 'branch'\],\r?\n    queryFn: async \(\) => \{\r?\n      const res = await apiRequest\('GET', '\/api\/shifts\/branch'\);\r?\n      return res\.json\(\);\r?\n    \},\r?\n  \}\);/;

const newCode = `// Performance: Only fetch a focused sliding window of shifts
  // (1 week before → 2 weeks after the current view) to prevent
  // loading ALL historical shifts which kills low-end devices.
  const shiftWindowStart = useMemo(() => format(subWeeks(weekStart, 1), 'yyyy-MM-dd'), [weekStart]);
  const shiftWindowEnd = useMemo(() => format(endOfWeek(addWeeks(weekStart, 2), { weekStartsOn: 1 }), 'yyyy-MM-dd'), [weekStart]);

  const { data: shiftsData, isLoading: shiftsLoading } = useQuery<{ shifts: Shift[] }>({
    queryKey: ['shifts', 'branch', shiftWindowStart, shiftWindowEnd],
    queryFn: async () => {
      const res = await apiRequest('GET', \`/api/shifts/branch?startDate=\${shiftWindowStart}&endDate=\${shiftWindowEnd}\`);
      return res.json();
    },
    // Keep stale schedule visible while the new week loads — fixes "disappearing schedule" bug.
    placeholderData: (previousData) => previousData,
  });`;

if (oldPattern.test(content)) {
  content = content.replace(oldPattern, newCode);
  fs.writeFileSync(filePath, content);
  console.log('SUCCESS: Replaced shifts query with date-bounded version');
} else {
  console.log('FAILED: Pattern not found');
  // Debug: search for the queryKey
  const idx = content.indexOf("queryKey: ['shifts', 'branch']");
  if (idx !== -1) {
    console.log('Found queryKey at char index:', idx);
    console.log('Context:', content.substring(idx - 200, idx + 200));
  }
}
