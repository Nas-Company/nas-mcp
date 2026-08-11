# Cursor

Use this guide when configuring Cursor with the official hosted Nas.com MCP
server.

## MCP Configuration

Add a remote Streamable HTTP MCP server named `nas-com`.

Example `.cursor/mcp.json`:

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

Cursor versions and workspaces can differ in exact MCP config location. Keep
the server type as hosted/HTTP/Streamable HTTP and keep the URL exactly:

```text
https://mcp.nas.com/mcp
```

Do not use `https://nas.com/mcp` as the MCP endpoint.

## OAuth and Scopes

Discover tools first. Authenticate through Cursor's MCP OAuth flow when a
protected tool challenges. The public metadata chain is:

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

## Cursor Agent Rule

```text
For Nas.com MCP tasks, use the `nas-com` remote MCP server at
https://mcp.nas.com/mcp. Run initialize, notifications/initialized, and
tools/list before tool use. Authenticate only when a protected
tool requires it and treat live MCP discovery as the source of truth. Do not
infer undocumented Nas.com APIs, write tools,
webhooks, checkout/payment APIs, or API key flows.
```

## When To Use It

Use the Nas.com MCP server when a user asks for authenticated Nas.com business
context, community members, product context, or physical product order context.
Use public Nas.com pages and AI-readable docs for public product positioning or
developer discovery questions that do not require authenticated account data.
