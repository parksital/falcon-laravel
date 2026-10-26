<?php

use App\Http\Middleware\SetBearerTokenFromPath;
use App\Mcp\Servers\IngressServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp', IngressServer::class)->middleware(['throttle:60,1', 'auth:sanctum', 'can:ingest']);

Mcp::web('/mcp/{token}', IngressServer::class)->middleware([SetBearerTokenFromPath::class, 'throttle:60,1', 'auth:sanctum', 'can:ingest']);
