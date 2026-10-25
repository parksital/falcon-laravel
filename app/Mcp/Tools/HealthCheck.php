<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('health_check')]
#[Description('Check that the Huurmaar MCP server is reachable and your token is accepted. Returns "ok".')]
class HealthCheck extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        return Response::text('ok');
    }
}
