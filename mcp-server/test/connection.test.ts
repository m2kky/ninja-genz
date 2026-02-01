import fetch from 'node-fetch';

async function testServerHealth() {
  console.log('🧪 Testing MCP Server Health...\n');

  try {
    const response = await fetch('http://localhost:3000/health');
    const data: any = await response.json();

    if (data.status === 'ok') {
      console.log('✅ Server is running');
      console.log('📊 Server info:', JSON.stringify(data, null, 2));
      console.log('\n✅ Phase 1 Complete - Server is operational!\n');
    } else {
      console.log('❌ Server returned unexpected status:', data.status);
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Server is not responding:', error.message);
    console.log('\nTip: Make sure to run "npm run dev" in the mcp-server directory first.');
    process.exit(1);
  }
}

testServerHealth();
