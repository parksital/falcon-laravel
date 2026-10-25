<?php

use App\Mcp\Servers\IngressServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp', IngressServer::class)->middleware(['throttle:60,1', 'auth:sanctum', 'can:ingest']);
