// Automated E2E Test Suite for QueueFlow REST APIs & Business Rules
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function request(method, path, body = null, token = null) {
  const url = new URL(`${API_BASE}${path}`);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Running QueueFlow Comprehensive Verification Tests');
  console.log('====================================================\n');

  const randomSuffix = Math.floor(Math.random() * 100000);
  const managerAEmail = `manager.a.${randomSuffix}@example.com`;
  const managerBEmail = `manager.b.${randomSuffix}@example.com`;
  const password = 'SecretPassword123!';

  // Test 1: Register Manager A
  console.log('Test 1: Manager A Registration');
  const regRes = await request('POST', '/auth/register', {
    name: 'Sarah Connor',
    email: managerAEmail,
    password,
  });
  assert(regRes.status === 201, 'Manager A registered with status 201');
  assert(regRes.data.data.token, 'Registration returns JWT token');
  const tokenA = regRes.data.data.token;
  const managerAId = regRes.data.data.manager.id;

  // Test 2: Login Manager A
  console.log('\nTest 2: Manager A Login');
  const loginRes = await request('POST', '/auth/login', {
    email: managerAEmail,
    password,
  });
  assert(loginRes.status === 200, 'Manager A logged in with status 200');
  assert(loginRes.data.data.token, 'Login returned valid JWT');

  // Test 3: Authenticated Get Me
  console.log('\nTest 3: Authentication Verification (/auth/me)');
  const meRes = await request('GET', '/auth/me', null, tokenA);
  assert(meRes.status === 200, 'GET /auth/me returns status 200');
  assert(meRes.data.data.manager.email === managerAEmail, 'Me returns correct manager profile');

  // Test 4: Create Queue
  console.log('\nTest 4: Queue Creation');
  const queueRes = await request('POST', '/queues', {
    name: 'Counter 1 - Fast Track',
  }, tokenA);
  assert(queueRes.status === 201, 'Queue created with status 201');
  const queueId = queueRes.data.data._id;
  assert(queueRes.data.data.name === 'Counter 1 - Fast Track', 'Queue has correct name');

  // Test 5: Add Tokens sequentially (T001, T002, T003, T004)
  console.log('\nTest 5: Adding multiple people & token generation');
  const people = [
    { name: 'John Doe', phone: '+1234567890' },
    { name: 'Jane Smith', phone: '+1234567891' },
    { name: 'Robert Paulson', phone: '+1234567892' },
    { name: 'Alice Walker', phone: '+1234567893' },
  ];

  const addedTokens = [];
  for (let i = 0; i < people.length; i++) {
    const tRes = await request('POST', `/queues/${queueId}/tokens`, {
      personName: people[i].name,
      phoneNumber: people[i].phone,
    }, tokenA);
    assert(tRes.status === 201, `Added person ${people[i].name}`);
    assert(tRes.data.data.position === i + 1, `Assigned correct sequential position: ${i + 1}`);
    addedTokens.push(tRes.data.data);
  }

  assert(addedTokens[0].tokenNumber === 'T001', 'First token number is T001');
  assert(addedTokens[1].tokenNumber === 'T002', 'Second token number is T002');
  assert(addedTokens[2].tokenNumber === 'T003', 'Third token number is T003');
  assert(addedTokens[3].tokenNumber === 'T004', 'Fourth token number is T004');

  // Test 6: Move Token Up
  console.log('\nTest 6: Move Token Up (Move T003 from position 3 to position 2)');
  const moveUpRes = await request('PATCH', `/tokens/${addedTokens[2]._id}/move-up`, null, tokenA);
  assert(moveUpRes.status === 200, 'Move Up succeeded');
  assert(moveUpRes.data.data.position === 2, 'T003 is now at position 2');

  // Verify previous token (T002) moved to position 3
  const tokensList1 = await request('GET', `/queues/${queueId}/tokens`, null, tokenA);
  const t002 = tokensList1.data.data.find(t => t.tokenNumber === 'T002');
  assert(t002.position === 3, 'T002 swapped into position 3');

  // Test 7: Move Token Down (Move T003 back down from position 2 to position 3)
  console.log('\nTest 7: Move Token Down (Move T003 from position 2 back down to position 3)');
  const moveDownRes = await request('PATCH', `/tokens/${addedTokens[2]._id}/move-down`, null, tokenA);
  assert(moveDownRes.status === 200, 'Move Down succeeded');
  assert(moveDownRes.data.data.position === 3, 'T003 is back at position 3');

  // Test 8: Call Next Token
  console.log('\nTest 8: Call Next Token (Calls T001 into Serving)');
  const callNextRes = await request('PATCH', `/queues/${queueId}/call-next`, null, tokenA);
  assert(callNextRes.status === 200, 'Call Next succeeded');
  assert(callNextRes.data.data.tokenNumber === 'T001', 'Called token is T001');
  assert(callNextRes.data.data.status === 'Serving', 'T001 status is Serving');
  assert(callNextRes.data.data.position === null, 'Serving token removed from waiting positions');
  assert(callNextRes.data.data.calledAt !== null, 'Service start time recorded');

  // Test 9: Enforce Business Rule: Only 1 token per queue can be Serving
  console.log('\nTest 9: Enforce Business Rule (Cannot call next while counter is already serving)');
  const invalidCallNext = await request('PATCH', `/queues/${queueId}/call-next`, null, tokenA);
  assert(invalidCallNext.status === 400, 'Rejected calling next when counter is already occupied');

  // Test 10: Complete Service
  console.log('\nTest 10: Complete Service');
  // Wait 1 second to produce real service duration
  await new Promise(r => setTimeout(r, 1100));
  const completeRes = await request('PATCH', `/tokens/${addedTokens[0]._id}/complete`, null, tokenA);
  assert(completeRes.status === 200, 'Complete Service succeeded');
  assert(completeRes.data.data.status === 'Completed', 'T001 status is Completed');
  assert(completeRes.data.data.serviceDuration >= 1, `Recorded service duration: ${completeRes.data.data.serviceDuration}s`);

  // Test 11: Cancel Waiting Token
  console.log('\nTest 11: Cancel Waiting Token');
  // Current waiting tokens should be T002 (pos 1), T003 (pos 2), T004 (pos 3)
  const cancelRes = await request('PATCH', `/tokens/${addedTokens[3]._id}/cancel`, null, tokenA);
  assert(cancelRes.status === 200, 'Cancel Token succeeded');
  assert(cancelRes.data.data.status === 'Cancelled', 'T004 status is Cancelled');

  // Test 12: Public Queue Display
  console.log('\nTest 12: Public Queue Display (No credentials required)');
  const publicRes = await request('GET', `/queues/${queueId}/public`);
  assert(publicRes.status === 200, 'Public queue display accessible');
  assert(publicRes.data.data.queue.name === 'Counter 1 - Fast Track', 'Queue name matches');
  assert(publicRes.data.data.totalWaiting === 2, '2 customers currently waiting');

  // Test 13: History Module
  console.log('\nTest 13: History Retrieval');
  const historyRes = await request('GET', '/history', null, tokenA);
  assert(historyRes.status === 200, 'History retrieved with status 200');
  assert(historyRes.data.data.tokens.length >= 4, 'All historical tokens preserved');
  assert(historyRes.data.data.pagination.total >= 4, 'Pagination counts correct');

  // Test 14: Analytics Module
  console.log('\nTest 14: Analytics Calculations');
  const analyticsRes = await request('GET', '/analytics/overview', null, tokenA);
  assert(analyticsRes.status === 200, 'Analytics overview retrieved');
  assert(analyticsRes.data.data.totalQueues >= 1, 'Total queues counted');
  assert(analyticsRes.data.data.completedCount >= 1, 'Completed tokens counted');
  assert(analyticsRes.data.data.cancelledCount >= 1, 'Cancelled tokens counted');
  assert(analyticsRes.data.data.avgServiceDuration >= 1, `Avg service duration computed from real records: ${analyticsRes.data.data.avgServiceDuration}s`);

  // Test 15: Manager Isolation / Access Control
  console.log('\nTest 15: Manager Security & Isolation');
  // Register Manager B
  const regB = await request('POST', '/auth/register', {
    name: 'Kyle Reese',
    email: managerBEmail,
    password,
  });
  const tokenB = regB.data.data.token;

  // Manager B attempts to access Manager A's queue
  const unauthorizedAccess = await request('GET', `/queues/${queueId}`, null, tokenB);
  assert(unauthorizedAccess.status === 404, 'Manager B cannot access Manager A queue (Status 404 / Unauthorized)');

  const unauthorizedTokenAdd = await request('POST', `/queues/${queueId}/tokens`, {
    personName: 'Hacker Bob',
  }, tokenB);
  assert(unauthorizedTokenAdd.status === 404, 'Manager B cannot add tokens to Manager A queue');

  console.log('\n====================================================');
  console.log('🎉 ALL 15 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});

