
// frontend/test-connection.ts

import { mcpClient } from "./src/services/mcp-client";

async function testConnection() {
  console.log("🧪 Testing Antigravity → MCP Server Connection");
  console.log("=".repeat(60));

  try {
    // Connect to server
    console.log("\n📡 Step 1: Attempting connection...");
    await mcpClient.connect();

    // Wait a bit
    console.log("\n⏳ Step 2: Waiting 5 seconds for notifications...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check status
    console.log("\n✅ Step 3: Checking connection status...");
    console.log("   Connected:", mcpClient.isConnected() ? "✅ Yes" : "❌ No");

    // Disconnect
    console.log("\n🔌 Step 4: Disconnecting...");
    mcpClient.disconnect();

    console.log("\n" + "=".repeat(60));
    console.log("🎉 TEST COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    console.error("\nTroubleshooting:");
    console.error("1. Is Trae's server running? Check other terminal");
    console.error("2. Is the URL correct? http://localhost:3000/mcp");
    console.error("3. Any firewall blocking port 3000?");
    process.exit(1);
  }
}

// Run test
testConnection();
