import { a0 as useTheme, r as reactExports, Q as jsxRuntimeExports, bt as Card, ag as alpha, bu as CardContent, X as Box, aJ as Stack, aj as Typography, am as Chip, b7 as Paper, bA as TextField, b_ as InputAdornment, bE as Alert, cP as TableContainer, cQ as Table, cR as TableHead, cS as TableRow, cT as TableCell, cU as TableBody } from './vendor-v-EuVKxF.js';

const sss2025Brackets = [
  { minSalary: 0, maxSalary: 5249.99, regularSSMSC: 5e3, mpfMSC: 0, totalMSC: 5e3, regularSSER: 500, mpfER: 0, ecER: 10, totalER: 510, regularSSEE: 250, mpfEE: 0, totalEE: 250, totalContributions: 760 },
  { minSalary: 5250, maxSalary: 5749.99, regularSSMSC: 5500, mpfMSC: 0, totalMSC: 5500, regularSSER: 550, mpfER: 0, ecER: 10, totalER: 560, regularSSEE: 275, mpfEE: 0, totalEE: 275, totalContributions: 835 },
  { minSalary: 5750, maxSalary: 6249.99, regularSSMSC: 6e3, mpfMSC: 0, totalMSC: 6e3, regularSSER: 600, mpfER: 0, ecER: 10, totalER: 610, regularSSEE: 300, mpfEE: 0, totalEE: 300, totalContributions: 910 },
  { minSalary: 6250, maxSalary: 6749.99, regularSSMSC: 6500, mpfMSC: 0, totalMSC: 6500, regularSSER: 650, mpfER: 0, ecER: 10, totalER: 660, regularSSEE: 325, mpfEE: 0, totalEE: 325, totalContributions: 985 },
  { minSalary: 6750, maxSalary: 7249.99, regularSSMSC: 7e3, mpfMSC: 0, totalMSC: 7e3, regularSSER: 700, mpfER: 0, ecER: 10, totalER: 710, regularSSEE: 350, mpfEE: 0, totalEE: 350, totalContributions: 1060 },
  { minSalary: 7250, maxSalary: 7749.99, regularSSMSC: 7500, mpfMSC: 0, totalMSC: 7500, regularSSER: 750, mpfER: 0, ecER: 10, totalER: 760, regularSSEE: 375, mpfEE: 0, totalEE: 375, totalContributions: 1135 },
  { minSalary: 7750, maxSalary: 8249.99, regularSSMSC: 8e3, mpfMSC: 0, totalMSC: 8e3, regularSSER: 800, mpfER: 0, ecER: 10, totalER: 810, regularSSEE: 400, mpfEE: 0, totalEE: 400, totalContributions: 1210 },
  { minSalary: 8250, maxSalary: 8749.99, regularSSMSC: 8500, mpfMSC: 0, totalMSC: 8500, regularSSER: 850, mpfER: 0, ecER: 10, totalER: 860, regularSSEE: 425, mpfEE: 0, totalEE: 425, totalContributions: 1285 },
  { minSalary: 8750, maxSalary: 9249.99, regularSSMSC: 9e3, mpfMSC: 0, totalMSC: 9e3, regularSSER: 900, mpfER: 0, ecER: 10, totalER: 910, regularSSEE: 450, mpfEE: 0, totalEE: 450, totalContributions: 1360 },
  { minSalary: 9250, maxSalary: 9749.99, regularSSMSC: 9500, mpfMSC: 0, totalMSC: 9500, regularSSER: 950, mpfER: 0, ecER: 10, totalER: 960, regularSSEE: 475, mpfEE: 0, totalEE: 475, totalContributions: 1435 },
  { minSalary: 9750, maxSalary: 10249.99, regularSSMSC: 1e4, mpfMSC: 0, totalMSC: 1e4, regularSSER: 1e3, mpfER: 0, ecER: 10, totalER: 1010, regularSSEE: 500, mpfEE: 0, totalEE: 500, totalContributions: 1510 },
  { minSalary: 10250, maxSalary: 10749.99, regularSSMSC: 10500, mpfMSC: 0, totalMSC: 10500, regularSSER: 1050, mpfER: 0, ecER: 10, totalER: 1060, regularSSEE: 525, mpfEE: 0, totalEE: 525, totalContributions: 1585 },
  { minSalary: 10750, maxSalary: 11249.99, regularSSMSC: 11e3, mpfMSC: 0, totalMSC: 11e3, regularSSER: 1100, mpfER: 0, ecER: 10, totalER: 1110, regularSSEE: 550, mpfEE: 0, totalEE: 550, totalContributions: 1660 },
  { minSalary: 11250, maxSalary: 11749.99, regularSSMSC: 11500, mpfMSC: 0, totalMSC: 11500, regularSSER: 1150, mpfER: 0, ecER: 10, totalER: 1160, regularSSEE: 575, mpfEE: 0, totalEE: 575, totalContributions: 1735 },
  { minSalary: 11750, maxSalary: 12249.99, regularSSMSC: 12e3, mpfMSC: 0, totalMSC: 12e3, regularSSER: 1200, mpfER: 0, ecER: 10, totalER: 1210, regularSSEE: 600, mpfEE: 0, totalEE: 600, totalContributions: 1810 },
  { minSalary: 12250, maxSalary: 12749.99, regularSSMSC: 12500, mpfMSC: 0, totalMSC: 12500, regularSSER: 1250, mpfER: 0, ecER: 10, totalER: 1260, regularSSEE: 625, mpfEE: 0, totalEE: 625, totalContributions: 1885 },
  { minSalary: 12750, maxSalary: 13249.99, regularSSMSC: 13e3, mpfMSC: 0, totalMSC: 13e3, regularSSER: 1300, mpfER: 0, ecER: 10, totalER: 1310, regularSSEE: 650, mpfEE: 0, totalEE: 650, totalContributions: 1960 },
  { minSalary: 13250, maxSalary: 13749.99, regularSSMSC: 13500, mpfMSC: 0, totalMSC: 13500, regularSSER: 1350, mpfER: 0, ecER: 10, totalER: 1360, regularSSEE: 675, mpfEE: 0, totalEE: 675, totalContributions: 2035 },
  { minSalary: 13750, maxSalary: 14249.99, regularSSMSC: 14e3, mpfMSC: 0, totalMSC: 14e3, regularSSER: 1400, mpfER: 0, ecER: 10, totalER: 1410, regularSSEE: 700, mpfEE: 0, totalEE: 700, totalContributions: 2110 },
  { minSalary: 14250, maxSalary: 14749.99, regularSSMSC: 14500, mpfMSC: 0, totalMSC: 14500, regularSSER: 1450, mpfER: 0, ecER: 10, totalER: 1460, regularSSEE: 725, mpfEE: 0, totalEE: 725, totalContributions: 2185 },
  { minSalary: 14750, maxSalary: 15249.99, regularSSMSC: 15e3, mpfMSC: 0, totalMSC: 15e3, regularSSER: 1500, mpfER: 0, ecER: 30, totalER: 1530, regularSSEE: 750, mpfEE: 0, totalEE: 750, totalContributions: 2280 },
  { minSalary: 15250, maxSalary: 15749.99, regularSSMSC: 15500, mpfMSC: 0, totalMSC: 15500, regularSSER: 1550, mpfER: 0, ecER: 30, totalER: 1580, regularSSEE: 775, mpfEE: 0, totalEE: 775, totalContributions: 2355 },
  { minSalary: 15750, maxSalary: 16249.99, regularSSMSC: 16e3, mpfMSC: 0, totalMSC: 16e3, regularSSER: 1600, mpfER: 0, ecER: 30, totalER: 1630, regularSSEE: 800, mpfEE: 0, totalEE: 800, totalContributions: 2430 },
  { minSalary: 16250, maxSalary: 16749.99, regularSSMSC: 16500, mpfMSC: 0, totalMSC: 16500, regularSSER: 1650, mpfER: 0, ecER: 30, totalER: 1680, regularSSEE: 825, mpfEE: 0, totalEE: 825, totalContributions: 2505 },
  { minSalary: 16750, maxSalary: 17249.99, regularSSMSC: 17e3, mpfMSC: 0, totalMSC: 17e3, regularSSER: 1700, mpfER: 0, ecER: 30, totalER: 1730, regularSSEE: 850, mpfEE: 0, totalEE: 850, totalContributions: 2580 },
  { minSalary: 17250, maxSalary: 17749.99, regularSSMSC: 17500, mpfMSC: 0, totalMSC: 17500, regularSSER: 1750, mpfER: 0, ecER: 30, totalER: 1780, regularSSEE: 875, mpfEE: 0, totalEE: 875, totalContributions: 2655 },
  { minSalary: 17750, maxSalary: 18249.99, regularSSMSC: 18e3, mpfMSC: 0, totalMSC: 18e3, regularSSER: 1800, mpfER: 0, ecER: 30, totalER: 1830, regularSSEE: 900, mpfEE: 0, totalEE: 900, totalContributions: 2730 },
  { minSalary: 18250, maxSalary: 18749.99, regularSSMSC: 18500, mpfMSC: 0, totalMSC: 18500, regularSSER: 1850, mpfER: 0, ecER: 30, totalER: 1880, regularSSEE: 925, mpfEE: 0, totalEE: 925, totalContributions: 2805 },
  { minSalary: 18750, maxSalary: 19249.99, regularSSMSC: 19e3, mpfMSC: 0, totalMSC: 19e3, regularSSER: 1900, mpfER: 0, ecER: 30, totalER: 1930, regularSSEE: 950, mpfEE: 0, totalEE: 950, totalContributions: 2880 },
  { minSalary: 19250, maxSalary: 19749.99, regularSSMSC: 19500, mpfMSC: 0, totalMSC: 19500, regularSSER: 1950, mpfER: 0, ecER: 30, totalER: 1980, regularSSEE: 975, mpfEE: 0, totalEE: 975, totalContributions: 2955 },
  { minSalary: 19750, maxSalary: 20249.99, regularSSMSC: 2e4, mpfMSC: 0, totalMSC: 2e4, regularSSER: 2e3, mpfER: 0, ecER: 30, totalER: 2030, regularSSEE: 1e3, mpfEE: 0, totalEE: 1e3, totalContributions: 3030 },
  // MPF brackets start (salary above ₱20,000)
  { minSalary: 20250, maxSalary: 20749.99, regularSSMSC: 2e4, mpfMSC: 500, totalMSC: 20500, regularSSER: 2e3, mpfER: 50, ecER: 30, totalER: 2080, regularSSEE: 1e3, mpfEE: 25, totalEE: 1025, totalContributions: 3105 },
  { minSalary: 20750, maxSalary: 21249.99, regularSSMSC: 2e4, mpfMSC: 1e3, totalMSC: 21e3, regularSSER: 2e3, mpfER: 100, ecER: 30, totalER: 2130, regularSSEE: 1e3, mpfEE: 50, totalEE: 1050, totalContributions: 3180 },
  { minSalary: 21250, maxSalary: 21749.99, regularSSMSC: 2e4, mpfMSC: 1500, totalMSC: 21500, regularSSER: 2e3, mpfER: 150, ecER: 30, totalER: 2180, regularSSEE: 1e3, mpfEE: 75, totalEE: 1075, totalContributions: 3255 },
  { minSalary: 21750, maxSalary: 22249.99, regularSSMSC: 2e4, mpfMSC: 2e3, totalMSC: 22e3, regularSSER: 2e3, mpfER: 200, ecER: 30, totalER: 2230, regularSSEE: 1e3, mpfEE: 100, totalEE: 1100, totalContributions: 3330 },
  { minSalary: 22250, maxSalary: 22749.99, regularSSMSC: 2e4, mpfMSC: 2500, totalMSC: 22500, regularSSER: 2e3, mpfER: 250, ecER: 30, totalER: 2280, regularSSEE: 1e3, mpfEE: 125, totalEE: 1125, totalContributions: 3405 },
  { minSalary: 22750, maxSalary: 23249.99, regularSSMSC: 2e4, mpfMSC: 3e3, totalMSC: 23e3, regularSSER: 2e3, mpfER: 300, ecER: 30, totalER: 2330, regularSSEE: 1e3, mpfEE: 150, totalEE: 1150, totalContributions: 3480 },
  { minSalary: 23250, maxSalary: 23749.99, regularSSMSC: 2e4, mpfMSC: 3500, totalMSC: 23500, regularSSER: 2e3, mpfER: 350, ecER: 30, totalER: 2380, regularSSEE: 1e3, mpfEE: 175, totalEE: 1175, totalContributions: 3555 },
  { minSalary: 23750, maxSalary: 24249.99, regularSSMSC: 2e4, mpfMSC: 4e3, totalMSC: 24e3, regularSSER: 2e3, mpfER: 400, ecER: 30, totalER: 2430, regularSSEE: 1e3, mpfEE: 200, totalEE: 1200, totalContributions: 3630 },
  { minSalary: 24250, maxSalary: 24749.99, regularSSMSC: 2e4, mpfMSC: 4500, totalMSC: 24500, regularSSER: 2e3, mpfER: 450, ecER: 30, totalER: 2480, regularSSEE: 1e3, mpfEE: 225, totalEE: 1225, totalContributions: 3705 },
  { minSalary: 24750, maxSalary: 25249.99, regularSSMSC: 2e4, mpfMSC: 5e3, totalMSC: 25e3, regularSSER: 2e3, mpfER: 500, ecER: 30, totalER: 2530, regularSSEE: 1e3, mpfEE: 250, totalEE: 1250, totalContributions: 3780 },
  { minSalary: 25250, maxSalary: 25749.99, regularSSMSC: 2e4, mpfMSC: 5500, totalMSC: 25500, regularSSER: 2e3, mpfER: 550, ecER: 30, totalER: 2580, regularSSEE: 1e3, mpfEE: 275, totalEE: 1275, totalContributions: 3855 },
  { minSalary: 25750, maxSalary: 26249.99, regularSSMSC: 2e4, mpfMSC: 6e3, totalMSC: 26e3, regularSSER: 2e3, mpfER: 600, ecER: 30, totalER: 2630, regularSSEE: 1e3, mpfEE: 300, totalEE: 1300, totalContributions: 3930 },
  { minSalary: 26250, maxSalary: 26749.99, regularSSMSC: 2e4, mpfMSC: 6500, totalMSC: 26500, regularSSER: 2e3, mpfER: 650, ecER: 30, totalER: 2680, regularSSEE: 1e3, mpfEE: 325, totalEE: 1325, totalContributions: 4005 },
  { minSalary: 26750, maxSalary: 27249.99, regularSSMSC: 2e4, mpfMSC: 7e3, totalMSC: 27e3, regularSSER: 2e3, mpfER: 700, ecER: 30, totalER: 2730, regularSSEE: 1e3, mpfEE: 350, totalEE: 1350, totalContributions: 4080 },
  { minSalary: 27250, maxSalary: 27749.99, regularSSMSC: 2e4, mpfMSC: 7500, totalMSC: 27500, regularSSER: 2e3, mpfER: 750, ecER: 30, totalER: 2780, regularSSEE: 1e3, mpfEE: 375, totalEE: 1375, totalContributions: 4155 },
  { minSalary: 27750, maxSalary: 28249.99, regularSSMSC: 2e4, mpfMSC: 8e3, totalMSC: 28e3, regularSSER: 2e3, mpfER: 800, ecER: 30, totalER: 2830, regularSSEE: 1e3, mpfEE: 400, totalEE: 1400, totalContributions: 4230 },
  { minSalary: 28250, maxSalary: 28749.99, regularSSMSC: 2e4, mpfMSC: 8500, totalMSC: 28500, regularSSER: 2e3, mpfER: 850, ecER: 30, totalER: 2880, regularSSEE: 1e3, mpfEE: 425, totalEE: 1425, totalContributions: 4305 },
  { minSalary: 28750, maxSalary: 29249.99, regularSSMSC: 2e4, mpfMSC: 9e3, totalMSC: 29e3, regularSSER: 2e3, mpfER: 900, ecER: 30, totalER: 2930, regularSSEE: 1e3, mpfEE: 450, totalEE: 1450, totalContributions: 4380 },
  { minSalary: 29250, maxSalary: 29749.99, regularSSMSC: 2e4, mpfMSC: 9500, totalMSC: 29500, regularSSER: 2e3, mpfER: 950, ecER: 30, totalER: 2980, regularSSEE: 1e3, mpfEE: 475, totalEE: 1475, totalContributions: 4455 },
  { minSalary: 29750, maxSalary: 30249.99, regularSSMSC: 2e4, mpfMSC: 1e4, totalMSC: 3e4, regularSSER: 2e3, mpfER: 1e3, ecER: 30, totalER: 3030, regularSSEE: 1e3, mpfEE: 500, totalEE: 1500, totalContributions: 4530 },
  { minSalary: 30250, maxSalary: 30749.99, regularSSMSC: 2e4, mpfMSC: 10500, totalMSC: 30500, regularSSER: 2e3, mpfER: 1050, ecER: 30, totalER: 3080, regularSSEE: 1e3, mpfEE: 525, totalEE: 1525, totalContributions: 4605 },
  { minSalary: 30750, maxSalary: 31249.99, regularSSMSC: 2e4, mpfMSC: 11e3, totalMSC: 31e3, regularSSER: 2e3, mpfER: 1100, ecER: 30, totalER: 3130, regularSSEE: 1e3, mpfEE: 550, totalEE: 1550, totalContributions: 4680 },
  { minSalary: 31250, maxSalary: 31749.99, regularSSMSC: 2e4, mpfMSC: 11500, totalMSC: 31500, regularSSER: 2e3, mpfER: 1150, ecER: 30, totalER: 3180, regularSSEE: 1e3, mpfEE: 575, totalEE: 1575, totalContributions: 4755 },
  { minSalary: 31750, maxSalary: 32249.99, regularSSMSC: 2e4, mpfMSC: 12e3, totalMSC: 32e3, regularSSER: 2e3, mpfER: 1200, ecER: 30, totalER: 3230, regularSSEE: 1e3, mpfEE: 600, totalEE: 1600, totalContributions: 4830 },
  { minSalary: 32250, maxSalary: 32749.99, regularSSMSC: 2e4, mpfMSC: 12500, totalMSC: 32500, regularSSER: 2e3, mpfER: 1250, ecER: 30, totalER: 3280, regularSSEE: 1e3, mpfEE: 625, totalEE: 1625, totalContributions: 4905 },
  { minSalary: 32750, maxSalary: 33249.99, regularSSMSC: 2e4, mpfMSC: 13e3, totalMSC: 33e3, regularSSER: 2e3, mpfER: 1300, ecER: 30, totalER: 3330, regularSSEE: 1e3, mpfEE: 650, totalEE: 1650, totalContributions: 4980 },
  { minSalary: 33250, maxSalary: 33749.99, regularSSMSC: 2e4, mpfMSC: 13500, totalMSC: 33500, regularSSER: 2e3, mpfER: 1350, ecER: 30, totalER: 3380, regularSSEE: 1e3, mpfEE: 675, totalEE: 1675, totalContributions: 5055 },
  { minSalary: 33750, maxSalary: 34249.99, regularSSMSC: 2e4, mpfMSC: 14e3, totalMSC: 34e3, regularSSER: 2e3, mpfER: 1400, ecER: 30, totalER: 3430, regularSSEE: 1e3, mpfEE: 700, totalEE: 1700, totalContributions: 5130 },
  { minSalary: 34250, maxSalary: 34749.99, regularSSMSC: 2e4, mpfMSC: 14500, totalMSC: 34500, regularSSER: 2e3, mpfER: 1450, ecER: 30, totalER: 3480, regularSSEE: 1e3, mpfEE: 725, totalEE: 1725, totalContributions: 5205 },
  { minSalary: 34750, maxSalary: null, regularSSMSC: 2e4, mpfMSC: 15e3, totalMSC: 35e3, regularSSER: 2e3, mpfER: 1500, ecER: 30, totalER: 3530, regularSSEE: 1e3, mpfEE: 750, totalEE: 1750, totalContributions: 5280 }
];

function SSSContributionTable() {
  const theme = useTheme();
  const [searchSalary, setSearchSalary] = reactExports.useState("");
  const matchedBracket = reactExports.useMemo(() => {
    const salary = parseFloat(searchSalary);
    if (isNaN(salary) || salary < 0) return null;
    return sss2025Brackets.find((b) => {
      if (b.maxSalary === null) return salary >= b.minSalary;
      return salary >= b.minSalary && salary <= b.maxSalary;
    });
  }, [searchSalary]);
  const formatCurrency = (value) => {
    return `₱${value.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const formatRange = (min, max) => {
    if (min === 0) return `Below ₱5,250`;
    if (max === null) return `₱${min.toLocaleString()} - Over`;
    return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      elevation: 0,
      sx: {
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            sx: {
              background: `linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)`,
              color: "white",
              p: 3
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 700, children: "SCHEDULE OF SSS CONTRIBUTIONS" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.9 }, children: "Business Employers and Employees • Effective January 2025" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: "Circular No. 2024-006",
                    size: "small",
                    sx: {
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 600
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Paper,
                {
                  elevation: 0,
                  sx: {
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    minWidth: 280
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "rgba(255,255,255,0.8)", display: "block", mb: 1 }, children: "Find your contribution bracket:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TextField,
                      {
                        size: "small",
                        placeholder: "Enter monthly salary",
                        value: searchSalary,
                        onChange: (e) => setSearchSalary(e.target.value),
                        InputProps: {
                          startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", sx: { color: "white" }, children: "₱" }),
                          sx: {
                            bgcolor: "rgba(255,255,255,0.2)",
                            borderRadius: 2,
                            color: "white",
                            "& input": { color: "white" },
                            "& input::placeholder": { color: "rgba(255,255,255,0.6)" }
                          }
                        },
                        sx: { width: "100%" }
                      }
                    ),
                    matchedBracket && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "rgba(255,255,255,0.7)" }, children: "Your contribution:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 700, children: [
                          "EE: ",
                          formatCurrency(matchedBracket.totalEE)
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", fontWeight: 700, children: [
                          "ER: ",
                          formatCurrency(matchedBracket.totalER)
                        ] }) })
                      ] })
                    ] })
                  ]
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { borderRadius: 0, py: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Rate:" }),
          " 15% (10% ER + 5% EE) • ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "MSC Range:" }),
          " ₱5,000 - ₱35,000 • MPF applies for salaries above ₱20,249.99 • EC: ₱10 (MSC < ₱15k) or ₱30 (MSC ≥ ₱15k)"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { sx: { maxHeight: 600 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { stickyHeader: true, size: "small", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableHead, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TableCell,
                {
                  rowSpan: 2,
                  sx: {
                    bgcolor: "#1565c0",
                    color: "white",
                    fontWeight: 700,
                    borderRight: "1px solid rgba(255,255,255,0.2)",
                    textAlign: "center",
                    minWidth: 160
                  },
                  children: [
                    "RANGE OF",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    "COMPENSATION"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TableCell,
                {
                  colSpan: 3,
                  sx: {
                    bgcolor: "#1976d2",
                    color: "white",
                    fontWeight: 700,
                    textAlign: "center",
                    borderRight: "1px solid rgba(255,255,255,0.2)"
                  },
                  children: "MONTHLY SALARY CREDIT"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TableCell,
                {
                  colSpan: 4,
                  sx: {
                    bgcolor: "#2196f3",
                    color: "white",
                    fontWeight: 700,
                    textAlign: "center",
                    borderRight: "1px solid rgba(255,255,255,0.2)"
                  },
                  children: "EMPLOYER"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TableCell,
                {
                  colSpan: 3,
                  sx: {
                    bgcolor: "#43a047",
                    color: "white",
                    fontWeight: 700,
                    textAlign: "center",
                    borderRight: "1px solid rgba(255,255,255,0.2)"
                  },
                  children: "EMPLOYEE"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TableCell,
                {
                  rowSpan: 2,
                  sx: {
                    bgcolor: "#ff9800",
                    color: "white",
                    fontWeight: 700,
                    textAlign: "center"
                  },
                  children: "TOTAL"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#1976d2", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }, children: "Regular SS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#1976d2", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }, children: "MPF" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#1976d2", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem", borderRight: "1px solid rgba(255,255,255,0.2)" }, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }, children: "Regular SS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }, children: "MPF" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }, children: "EC" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#2196f3", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem", borderRight: "1px solid rgba(255,255,255,0.2)" }, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#43a047", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }, children: "Regular SS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#43a047", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem" }, children: "MPF" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { bgcolor: "#43a047", color: "white", fontWeight: 600, textAlign: "center", fontSize: "0.7rem", borderRight: "1px solid rgba(255,255,255,0.2)" }, children: "Total" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sss2025Brackets.map((bracket, index) => {
            const isMatched = matchedBracket && bracket.minSalary === matchedBracket.minSalary && bracket.maxSalary === matchedBracket.maxSalary;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                sx: {
                  bgcolor: isMatched ? alpha(theme.palette.success.main, 0.2) : index % 2 === 0 ? alpha(theme.palette.action.hover, 0.3) : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  },
                  ...isMatched && {
                    outline: `2px solid ${theme.palette.success.main}`,
                    outlineOffset: -2
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600, borderRight: "1px solid rgba(0,0,0,0.05)" }, children: formatRange(bracket.minSalary, bracket.maxSalary) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem" }, children: formatCurrency(bracket.regularSSMSC) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem", color: bracket.mpfMSC > 0 ? "text.primary" : "text.disabled" }, children: bracket.mpfMSC > 0 ? formatCurrency(bracket.mpfMSC) : "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem", fontWeight: 600, borderRight: "1px solid rgba(0,0,0,0.05)" }, children: formatCurrency(bracket.totalMSC) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem" }, children: formatCurrency(bracket.regularSSER) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem", color: bracket.mpfER > 0 ? "text.primary" : "text.disabled" }, children: bracket.mpfER > 0 ? formatCurrency(bracket.mpfER) : "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem" }, children: formatCurrency(bracket.ecER) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem", fontWeight: 600, color: "info.main", borderRight: "1px solid rgba(0,0,0,0.05)" }, children: formatCurrency(bracket.totalER) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem" }, children: formatCurrency(bracket.regularSSEE) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem", color: bracket.mpfEE > 0 ? "text.primary" : "text.disabled" }, children: bracket.mpfEE > 0 ? formatCurrency(bracket.mpfEE) : "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem", fontWeight: 600, color: "success.main", borderRight: "1px solid rgba(0,0,0,0.05)" }, children: formatCurrency(bracket.totalEE) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontSize: "0.85rem", fontWeight: 700, color: "warning.dark" }, children: formatCurrency(bracket.totalContributions) })
                ]
              },
              index
            );
          }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, bgcolor: alpha(theme.palette.action.hover, 0.3) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Source: SSS Circular No. 2024-006 dated 19 December 2024 • 61 brackets • MSC: Monthly Salary Credit • MPF: Mandatory Provident Fund • EC: Employees' Compensation" }) })
      ] })
    }
  );
}

export { SSSContributionTable as default };
