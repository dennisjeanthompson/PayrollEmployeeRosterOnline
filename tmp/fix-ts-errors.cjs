const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '..', 'server', 'routes.ts');
let routes = fs.readFileSync(routesPath, 'utf8');

// 1. Fix getTimeOffRequestsByBranch -> loop over users
// Find the block:
// const allTimeOff = await storage.getTimeOffRequestsByBranch(branchId);
const oldTimeOffCall = `const allTimeOff = await storage.getTimeOffRequestsByBranch(branchId);`;
const newTimeOffCall = `const allUsersInBranch = await storage.getUsersByBranch(branchId);
      const allTimeOff = (await Promise.all(allUsersInBranch.map(u => storage.getTimeOffRequestsByUser(u.id)))).flat();`;

routes = routes.replace(oldTimeOffCall, newTimeOffCall);

// 2. Fix the typing issues and the date issue
const oldFilter = `        .filter(t => {`;
const newFilter = `        .filter((t: any) => {`;
routes = routes.replace(oldFilter, newFilter);

const oldMap = `        .map(t => {`;
const newMap = `        .map((t: any) => {`;
routes = routes.replace(oldMap, newMap);

const oldLeave = `      const enrichedLeaves = await Promise.all(orphanedLeaves.map(async (leave) => {`;
const newLeave = `      const enrichedLeaves = await Promise.all(orphanedLeaves.map(async (leave: any) => {`;
routes = routes.replace(oldLeave, newLeave);

const oldLogMap = `      const logDetails = filteredLogs.slice(0, 20).map(l => {`;
const newLogMap = `      const logDetails = filteredLogs.slice(0, 20).map((l: any) => {`;
routes = routes.replace(oldLogMap, newLogMap);

const oldDate = `          date: l.date,`;
const newDate = `          date: l.startDate,`;
routes = routes.replace(oldDate, newDate);

const oldTradeMap = `      const affectedTrades = allTrades.filter(t =>`;
const newTradeMap = `      const affectedTrades = allTrades.filter((t: any) =>`;
routes = routes.replace(oldTradeMap, newTradeMap);

fs.writeFileSync(routesPath, routes, 'utf8');
console.log('Fixed TS errors in server/routes.ts');
