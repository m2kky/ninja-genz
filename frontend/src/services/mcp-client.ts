
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { z } from "zod";

/**
 * Antigravity MCP Client - Connects to Trae's MCP Server
 * Server URL: http://localhost:3000/mcp
 */
class AntigravityMCPClient {
  private client: Client;
  private serverUrl: string = "http://localhost:3000/mcp/sse";
  private connected: boolean = false;

  constructor() {
    this.client = new Client(
      {
        name: "antigravity-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    console.log("🎨 Antigravity MCP Client initialized");
  }

  /**
   * Connect to Trae's MCP Server
   */
  async connect(): Promise<void> {
    try {
      console.log(`🔌 Connecting to MCP Server at ${this.serverUrl}...`);

      // Create SSE transport with Antigravity identification
      // We pass headers to both eventSourceInit (for connection) and requestInit (for messages)
      const transport = new SSEClientTransport(new URL(this.serverUrl), {
         eventSourceInit: {
            headers: {
                "X-Agent-Name": "antigravity"
            }
         } as any, // Cast to any because standard EventSourceInit doesn't support headers, but the polyfill does
         requestInit: {
            headers: {
                "X-Agent-Name": "antigravity"
            }
         }
      });

      // Setup notification handlers using Zod schemas
      this.client.setNotificationHandler(
        z.object({
            method: z.literal("notifications/handoff/new"),
            params: z.any()
        }),
        async (params) => {
          this.handleNotification({ method: "notifications/handoff/new", params });
        }
      );

      this.client.setNotificationHandler(
        z.object({
            method: z.literal("notifications/handoff/updated"),
            params: z.any()
        }),
        async (params) => {
          this.handleNotification({ method: "notifications/handoff/updated", params });
        }
      );

      this.client.setNotificationHandler(
        z.object({
            method: z.literal("notifications/agent/statusChanged"),
            params: z.any()
        }),
        async (params) => {
          this.handleNotification({ method: "notifications/agent/statusChanged", params });
        }
      );

      // Connect!
      await this.client.connect(transport);
      this.connected = true;

      console.log("✅ Successfully connected to MCP Server!");
      console.log("📡 Listening for notifications from Trae...");
    } catch (error) {
      console.error("❌ Connection failed:", error);
      // throw new Error(`Failed to connect: ${error}`);
    }
  }

  /**
   * Handle incoming notifications from server
   */
  private handleNotification(notification: any): void {
    console.log("📬 Notification received:", notification.method);

    switch (notification.method) {
      case "notifications/handoff/new":
        console.log("🆕 New handoff from Trae:", notification.params);
        break;

      case "notifications/handoff/updated":
        console.log("📊 Handoff updated:", notification.params);
        break;

      case "notifications/agent/statusChanged":
        console.log("👤 Trae status changed:", notification.params);
        break;

      default:
        console.log("ℹ️  Other notification:", notification);
    }
  }

  /**
   * Check if connected to server
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.connected) {
      console.log("👋 Disconnecting from MCP Server...");
      this.connected = false;
      console.log("✅ Disconnected");
    }
  }
}

// Export singleton instance
export const mcpClient = new AntigravityMCPClient();
