# Zed

Use this guide when configuring Zed Agent with the official hosted Nas.com MCP
server.

## MCP Configuration

In Zed, open the Command Palette and run:

```text
agent: add context server
```

You can also open the settings file with:

```text
zed: open settings file
```

Add a remote context server named `nas-com`:

```json
{
  "context_servers": {
    "nas-com": {
      "url": "https://mcp.nas.com/mcp"
    }
  }
}
```

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## OAuth and Scopes

For remote MCP servers without an `Authorization` header, Zed should prompt for
the standard MCP OAuth flow.

NAS publishes the OAuth metadata chain at:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.com/.well-known/oauth-authorization-server
```

Request only the task's required scopes:

- `nas.communities.read`
- `nas.communities.write`
- `nas.members.read`
- `nas.products.read`
- `nas.products.write`
- `nas.orders.read`

## First Use Checklist

1. Add `nas-com` as a custom context server.
2. Check the Agent Panel settings indicator; it should show the server as
   active.
3. Run discovery before tool use:
   `initialize`, `notifications/initialized`, and `tools/list`.
4. Complete OAuth when a protected tool prompts for it, then retry the tool.
5. Use only tools returned by live discovery.

## Zed Instruction Snippet

```text
Use the `nas-com` MCP context server for authenticated Nas.com business,
member, product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Discover tools before authenticating and treat live
MCP discovery as the runtime source of truth. Do not infer undocumented Nas.com
APIs, write tools, webhooks, checkout/payment APIs, or API key flows.
```
