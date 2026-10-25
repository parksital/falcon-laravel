<?php

use App\Mcp\Servers\IngressServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp', IngressServer::class)->middleware(['auth:sanctum', 'can:ingest']);
