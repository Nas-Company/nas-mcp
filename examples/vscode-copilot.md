# VS Code and GitHub Copilot

Use this guide when configuring Visual Studio Code chat or GitHub Copilot in VS
Code with the official hosted Nas.com MCP server.

## MCP Configuration

VS Code supports MCP server configuration in a workspace file:

```text
.vscode/mcp.json
```

It also supports user-profile MCP configuration through the command:

```text
MCP: Open User Configuration
```

Add a remote HTTP MCP server named `nas-com`:

```json
{
  "servers": {
    "nas-com": {
      "type": "http",
      "url": "https://mcp.nas.com/mcp"
    }
  }
}
```

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## OAuth and Scopes

Use VS Code's MCP authentication flow for remote servers. NAS publishes the
OAuth metadata chain at:

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

1. Add `nas-com` to workspace or user `mcp.json`.
2. Start the server from VS Code's MCP controls.
3. Confirm that you trust the server when prompted.
4. Authenticate through the MCP OAuth flow.
5. Use the chat tools picker to confirm NAS tools are available.
6. Run discovery before tool use:
   `initialize`, `tools/list`, `resources/list`, and `resources/templates/list`.
7. Use only tools and resources returned by authenticated discovery.

## VS Code Instruction Snippet

```text
Use the `nas-com` MCP server for authenticated Nas.com business, member,
product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Trust and authenticate the server in VS Code before
tool use. Treat authenticated MCP discovery as the runtime source of truth. Do
not infer undocumented Nas.com seller/admin, checkout, payment, webhook, API
key, OAuth, REST, GraphQL, or MCP write contracts.
```
