# Claude

Use this guide when configuring Claude Desktop, Claude Code, or another
Claude-compatible MCP client with the official hosted Nas.com MCP server.

## MCP Server

Configure a Streamable HTTP MCP server named `nas-com`:

```json
{
  "mcpServers": {
    "nas-com": {
      "type": "http",
      "url": "https://mcp.nas.com/mcp"
    }
  }
}
```

If your Claude client uses a different config shape for remote HTTP MCP
servers, keep the same server name and URL.

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## Authentication

Connect and discover tools first. Complete OAuth in the client when a protected
tool challenges, then retry that tool. Use the published metadata chain:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.com/.well-known/oauth-authorization-server
```

Supported documented scopes:

- `nas.communities.read`
- `nas.communities.write`
- `nas.members.read`
- `nas.products.read`
- `nas.products.write`
- `nas.orders.read`

## First Use Checklist

1. Connect the `nas-com` MCP server.
2. Run `initialize` and send `notifications/initialized`.
3. Run `tools/list`.
4. Start with an anonymous onboarding tool when it fits the request.
5. Complete OAuth only when a protected tool requires it, then retry the tool.
6. Use only tools returned by live discovery.

## Claude Instruction Snippet

```text
Use the `nas-com` MCP server for authenticated Nas.com business, member,
product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Run discovery before invoking tools. Do not invent
Nas.com seller/admin, checkout, payment, webhook, API key, OAuth, REST,
GraphQL, or MCP write contracts that are not documented or returned by
live discovery.
```
