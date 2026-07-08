# Gemini CLI

Use this guide when configuring Gemini CLI with the official hosted Nas.com MCP
server.

## MCP Configuration

Gemini CLI reads MCP server definitions from `settings.json` under
`mcpServers`.

Add a Streamable HTTP MCP server named `nas-com`:

```json
{
  "mcpServers": {
    "nas-com": {
      "httpUrl": "https://mcp.nas.com/mcp"
    }
  }
}
```

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## OAuth and Scopes

Gemini CLI supports OAuth for remote SSE and HTTP MCP servers. If OAuth
discovery is available, keep the server config minimal and authenticate from
Gemini CLI:

```bash
/mcp auth nas-com
```

NAS publishes the OAuth metadata chain at:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.io/.well-known/oauth-authorization-server
```

Request only the task's required read scopes:

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

## Optional Tool Controls

Use Gemini CLI's MCP allow/exclude settings if you need to restrict server or
tool access:

```json
{
  "mcp": {
    "allowed": ["nas-com"]
  }
}
```

## First Use Checklist

1. Add `nas-com` to `settings.json`.
2. Run `/mcp` to inspect connected servers.
3. Run `/mcp auth nas-com` if authentication is required.
4. Confirm tools, prompts, and resources are discovered.
5. Use only tools and resources returned by authenticated discovery.

## Gemini Instruction Snippet

```text
Use the `nas-com` MCP server for authenticated Nas.com business, member,
product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Authenticate with `/mcp auth nas-com` when required,
inspect discovered tools before use, and do not infer undocumented Nas.com
seller/admin, checkout, payment, webhook, API key, OAuth, REST, GraphQL, or MCP
write contracts.
```
