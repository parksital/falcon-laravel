<?php

use App\Models\Admin;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

function initializeMcp(?string $token = null)
{
    $headers = ['Accept' => 'application/json, text/event-stream'];

    if ($token) {
        $headers['Authorization'] = 'Bearer '.$token;
    }

    return test()->postJson('/mcp', [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'initialize',
        'params' => ['protocolVersion' => '2025-06-18', 'capabilities' => (object) [], 'clientInfo' => ['name' => 'test', 'version' => '1']],
    ], $headers);
}

test('requests without a token are refused', function () {
    initializeMcp()->assertUnauthorized();
});

test('requests with an unknown token are refused', function () {
    initializeMcp('1|not-a-real-token')->assertUnauthorized();
});

test('tokens that belong to a vendor user are refused', function () {
    $user = User::factory()->create();
    $token = PersonalAccessToken::forceCreate([
        'tokenable_type' => $user->getMorphClass(),
        'tokenable_id' => $user->id,
        'name' => 'claude-code',
        'token' => hash('sha256', 'vendor-token'),
        'abilities' => ['*'],
    ]);

    expect(initializeMcp($token->id.'|vendor-token')->status())->toBeIn([401, 403]);
});

test('admins can connect with a personal token', function () {
    $admin = Admin::create(['name' => 'Founder', 'email' => 'founder@example.com', 'password' => 'password']);

    initializeMcp($admin->createToken('claude-code')->plainTextToken)
        ->assertOk()
        ->assertJsonPath('result.serverInfo.name', 'Huurmaar Ingress');
});
