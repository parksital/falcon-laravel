<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\CreateService;
use App\Mcp\Tools\CreateVendor;
use App\Mcp\Tools\GetCatalogSchema;
use App\Mcp\Tools\HealthCheck;
use App\Mcp\Tools\RequestVendorLogoUpload;
use App\Mcp\Tools\SearchVendors;
use App\Mcp\Tools\SetVendorLogo;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Huurmaar Ingress')]
#[Version('0.0.1')]
#[Instructions(<<<'MARKDOWN'
Admin tools for the Huurmaar vendor and service catalog.

Follow these rules when importing a business:

- Call `get-catalog-schema` first, then `search-vendors` to check the business isn't already in the catalog before creating anything.
- Never guess prices, contact details or categories. Ask the admin, or leave optional fields empty.
- Summarize what you're about to create (vendor, services, prices, logo) and get the admin's confirmation before writing.
- Finish with the public URLs of everything created.
MARKDOWN)]
class IngressServer extends Server
{
    protected array $tools = [
        HealthCheck::class,
        GetCatalogSchema::class,
        SearchVendors::class,
        CreateVendor::class,
        CreateService::class,
        RequestVendorLogoUpload::class,
        SetVendorLogo::class,
    ];

    protected array $resources = [
        //
    ];

    protected array $prompts = [
        //
    ];
}
