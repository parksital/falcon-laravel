<?php

use App\Mcp\Servers\IngressServer;
use App\Mcp\Tools\HealthCheck;
use App\Models\Admin;

test('health check returns ok', function () {
    $admin = Admin::create(['name' => 'Founder', 'email' => 'founder@example.com', 'password' => 'password']);

    IngressServer::actingAs($admin)->tool(HealthCheck::class)
        ->assertOk()
        ->assertName('health-check')
        ->assertSee('ok');
});
