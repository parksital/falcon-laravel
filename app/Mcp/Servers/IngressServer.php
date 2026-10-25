<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\HealthCheck;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Huurmaar Ingress')]
#[Version('0.0.1')]
#[Instructions('Admin tools for the Huurmaar vendor and service catalog.')]
class IngressServer extends Server
{
    protected array $tools = [
        HealthCheck::class,
    ];

    protected array $resources = [
        //
    ];

    protected array $prompts = [
        //
    ];
}
