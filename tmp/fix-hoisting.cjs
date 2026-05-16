const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '..', 'server', 'routes.ts');
let routes = fs.readFileSync(routesPath, 'utf8');

const tradesBlock = `      // Check for shift trades that would be affected
      const shiftIds = filteredShifts.map(s => s.id);
      // We already have allUsersInBranch
      const allTradesRaw = (await Promise.all(allUsersInBranch.map(u => storage.getShiftTradesByUser(u.id)))).flat();`;

const fixedTradesBlock = `      const allUsersInBranch = await storage.getUsersByBranch(branchId);
      // Check for shift trades that would be affected
      const shiftIds = filteredShifts.map(s => s.id);
      const allTradesRaw = (await Promise.all(allUsersInBranch.map(u => storage.getShiftTradesByUser(u.id)))).flat();`;

routes = routes.replace(tradesBlock, fixedTradesBlock);

const timeOffBlock = `      // Check for time-off requests that overlap this date range
      const allUsersInBranch = await storage.getUsersByBranch(branchId);
      const allTimeOff = (await Promise.all(allUsersInBranch.map(u => storage.getTimeOffRequestsByUser(u.id)))).flat();`;

const fixedTimeOffBlock = `      // Check for time-off requests that overlap this date range
      const allTimeOff = (await Promise.all(allUsersInBranch.map(u => storage.getTimeOffRequestsByUser(u.id)))).flat();`;

routes = routes.replace(timeOffBlock, fixedTimeOffBlock);

fs.writeFileSync(routesPath, routes, 'utf8');
console.log('Fixed variable hoisting issue.');
