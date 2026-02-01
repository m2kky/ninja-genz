import fetch from 'node-fetch';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runTests() {
  console.log('🧪 MCP SERVER COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60) + '\n');

  try {
    console.log('Test 1: Health Check...');
    const res = await fetch('http://localhost:3000/health');
    const data: any = await res.json();

    if (data.status === 'ok') {
      results.push({ name: 'Health Check', passed: true });
      console.log('✅ PASSED\n');
    } else {
      throw new Error('Status not ok');
    }
  } catch (error: any) {
    results.push({ name: 'Health Check', passed: false, error: String(error) });
    console.log('❌ FAILED:', error, '\n');
  }

  try {
    console.log('Test 2: Status Endpoint...');
    const res = await fetch('http://localhost:3000/mcp/status');
    const data: any = await res.json();

    if (Array.isArray(data.agents) && data.agents.length >= 2) {
      results.push({ name: 'Status Endpoint', passed: true });
      console.log('✅ PASSED - Found agents\n');
    } else {
      throw new Error(`Expected agents array, got ${JSON.stringify(data)}`);
    }
  } catch (error: any) {
    results.push({ name: 'Status Endpoint', passed: false, error: String(error) });
    console.log('❌ FAILED:', error, '\n');
  }

  try {
    console.log('Test 3: Agent Data Validation...');
    const res = await fetch('http://localhost:3000/mcp/status');
    const data: any = await res.json();

    const agentNames = (data.agents || []).map((a: any) => a.agent_name).sort();
    const expectedNames = ['antigravity', 'trae'].sort();

    if (JSON.stringify(agentNames) === JSON.stringify(expectedNames)) {
      results.push({ name: 'Agent Data', passed: true });
      console.log('✅ PASSED - Both agents present\n');
    } else {
      throw new Error(`Expected agents [antigravity, trae], got ${agentNames}`);
    }
  } catch (error: any) {
    results.push({ name: 'Agent Data', passed: false, error: String(error) });
    console.log('❌ FAILED:', error, '\n');
  }

  try {
    console.log('Test 4: 404 Handling...');
    const res = await fetch('http://localhost:3000/nonexistent');

    if (res.status === 404) {
      results.push({ name: '404 Handling', passed: true });
      console.log('✅ PASSED - Returns 404 for invalid routes\n');
    } else {
      throw new Error(`Expected 404, got ${res.status}`);
    }
  } catch (error: any) {
    results.push({ name: '404 Handling', passed: false, error: String(error) });
    console.log('❌ FAILED:', error, '\n');
  }

  try {
    console.log('Test 5: CORS Configuration...');
    const res = await fetch('http://localhost:3000/health');
    const corsHeader = res.headers.get('access-control-allow-origin');

    if (corsHeader) {
      results.push({ name: 'CORS Headers', passed: true });
      console.log('✅ PASSED - CORS enabled\n');
    } else {
      throw new Error('CORS headers not present');
    }
  } catch (error: any) {
    results.push({ name: 'CORS Headers', passed: false, error: String(error) });
    console.log('❌ FAILED:', error, '\n');
  }

  console.log('='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('='.repeat(60));
  console.log(`Total: ${passed}/${total} tests passed`);
  console.log('='.repeat(60) + '\n');

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ MCP Server is ready for Phase 2\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

console.log('⏳ Starting tests in 2 seconds...\n');
setTimeout(runTests, 2000);
