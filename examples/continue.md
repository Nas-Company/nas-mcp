# Continue

Use this guide when configuring Continue with the official hosted Nas.com MCP
server.

## MCP Configuration

Continue supports MCP server blocks in config and standalone files under:

```text
.continue/mcpServers/
```

Create:

```text
.continue/mcpServers/nas-com.yaml
```

Add a Streamable HTTP MCP server:

```yaml
name: Nas.com MCP
version: 0.0.1
schema: v1
mcpServers:
  - name: nas-com
    type: streamable-http
    url: https://mcp.nas.com/mcp
```

Continue can also read JSON MCP configs from `.continue/mcpServers/`. If you
prefer JSON, use:

```json
{
  "mcpServers": {
    "nas-com": {
      "type": "streamable-http",
      "url": "https://mcp.nas.com/mcp"
    }
  }
}
```

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## OAuth and Scopes

Use Continue's MCP authentication flow for the remote server. NAS publishes the
OAuth metadata chain at:

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

1. Add `nas-com` under `.continue/mcpServers/` or your Continue config.
2. Use Continue Agent mode; MCP tools are intended for agent use.
3. Run discovery before tool use:
   `initialize`, `notifications/initialized`, and `tools/list`.
4. Authenticate through the client flow only when a protected tool prompts,
   then retry that tool.
5. Use only tools returned by live discovery. Anonymous
   onboarding tools do not require the authentication step.

## Continue Rule Snippet

```text
Use the `nas-com` MCP server for authenticated Nas.com business, member,
product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Use Continue Agent mode, run MCP discovery before tool
use, and do not infer undocumented Nas.com APIs, write tools, webhooks,
checkout/payment APIs, or API key flows.
```
