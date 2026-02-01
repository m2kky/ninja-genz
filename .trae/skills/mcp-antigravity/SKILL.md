---
name: "mcp-antigravity"
description: "Enables communication with Antigravity agent through MCP protocol. Invoke when user asks to contact, communicate, or send messages to Antigravity."
---

# MCP Antigravity Communication

This skill enables communication between agents using the Multi-Channel Protocol (MCP) to interact with the Antigravity agent.

## Usage

When invoked, this skill will:
1. Establish MCP connection to Antigravity
2. Send the user's message/request
3. Return Antigravity's response

## When to Invoke

Invoke this skill when:
- User asks to "talk to Antigravity"
- User wants to "contact Antigravity" 
- User requests to "send message to Antigravity"
- User mentions "MCP" and "Antigravity" together
- Any request to communicate with the Antigravity agent

## Example Interactions

User: "شغل الـ mcp اللي بيخيلك تكلم antigravity"
→ Invoke this skill to establish communication

User: "I need to contact Antigravity about the frontend"
→ Invoke this skill to relay the message

## Communication Protocol

The skill uses the shared communication files in `/.ai-agents/shared/`:
- `handoff-protocol.md` - For formal requests and responses
- `context.md` - For shared project context
- `TODO.md` - For task coordination

Messages are logged and tracked for proper agent coordination.