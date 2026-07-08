# Windsurf and Cascade

Use this guide when configuring Windsurf, Devin Desktop, or Cascade with the
official hosted Nas.com MCP server.

## MCP Configuration

Windsurf/Cascade MCP servers can be added from the MCP settings UI or by
editing:

```text
~/.codeium/windsurf/mcp_config.json
```

Add a remote Streamable HTTP MCP server named `nas-com`:

```json
{
  "mcpServers": {
    "nas-com": {
      "serverUrl": "https://mcp.nas.com/mcp"
    }
  }
}
```

Some versions also accept `url` for remote HTTP MCPs:

```json
{
  "mcpServers": {
    "nas-com": {
      "url": "https://mcp.nas.com/mcp"
    }
  }
}
```

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## OAuth and Scopes

Use the Cascade MCP authentication flow. NAS publishes the OAuth metadata chain
at:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.io/.well-known/oauth-authorization-server
```

Request only the task's required read scopes:

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

## First Use Checklist

1. Add `nas-com` in Cascade MCP settings or `mcp_config.json`.
2. Authenticate through the client OAuth flow.
3. Confirm the MCP server is active in Cascade MCP settings.
4. Enable only the NAS tools needed for the task.
5. Run discovery before tool use:
   `initialize`, `tools/list`, `resources/list`, and `resources/templates/list`.

## Cascade Rule Snippet

```text
Use the `nas-com` MCP server for authenticated Nas.com business, member,
product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Run MCP discovery before invoking tools. Do not infer
undocumented Nas.com seller/admin, checkout, payment, webhook, API key, OAuth,
REST, GraphQL, or MCP write contracts.
```
