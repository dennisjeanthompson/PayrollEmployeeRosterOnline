const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '..', 'server', 'routes.ts');
let routes = fs.readFileSync(routesPath, 'utf8');

// Replace: const allTrades = await storage.getShiftTradesByBranch(branchId);
// With loop over users
const oldTrades = `const allTrades = await storage.getShiftTradesByBranch(branchId);`;
const newTrades = `// We already have allUsersInBranch
      const allTradesRaw = (await Promise.all(allUsersInBranch.map(u => storage.getShiftTradesByUser(u.id)))).flat();
      // deduplicate
      const allTradesMap = new Map();
      allTradesRaw.forEach((t: any) => allTradesMap.set(t.id, t));
      const allTrades = Array.from(allTradesMap.values());`;

routes = routes.replace(oldTrades, newTrades);

fs.writeFileSync(routesPath, routes, 'utf8');
console.log('Fixed getShiftTradesByBranch TS error in server/routes.ts');
