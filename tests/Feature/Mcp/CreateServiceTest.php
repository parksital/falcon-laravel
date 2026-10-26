<?php

use App\Mcp\Servers\IngressServer;
use App\Mcp\Tools\CreateService;
use App\Models\Admin;
use App\Models\Service;
use App\Models\User;
use App\Models\Vendor;

beforeEach(function () {
    $this->admin = Admin::create(['name' => 'Founder', 'email' => 'founder@example.com', 'password' => 'password']);
    $this->vendor = Vendor::create(['uuid' => 'unclaimed', 'name' => 'Fotobooth Utrecht', 'slug' => 'fotobooth-utrecht', 'location' => 'Utrecht']);
});

test('creates a public service with pricing options and features', function () {
    $response = IngressServer::actingAs($this->admin)->tool(CreateService::class, [
        'vendor_slug' => 'fotobooth-utrecht',
        'name' => 'Fotobooth',
        'category' => 'photobooths',
        'pricing_options' => [
            ['name' => 'Basic', 'price_in_minor' => 14950, 'pricing_mode' => 'fixed', 'features' => [
                ['feature_key' => 'prints', 'value' => 'unlimited'],
                ['feature_key' => 'attendant', 'is_included' => false],
            ]],
            ['name' => 'Per hour', 'price_in_minor' => 5000, 'pricing_mode' => 'variable', 'pricing_unit' => 'hour'],
        ],
    ]);

    $service = Service::with('prices.features')->firstOrFail();

    $response->assertOk()->assertSee(route('public.booking.service.show', ['fotobooth-utrecht', $service->public_id]));

    expect($service->vendor_id)->toBe($this->vendor->id)
        ->and($service->is_public)->toBeTrue()
        ->and($service->prices->pluck('name')->all())->toBe(['Basic', 'Per hour'])
        ->and($service->prices[0]->pricing_unit)->toBeNull()
        ->and($service->prices[0]->features->pluck('feature_key')->all())->toBe(['prints', 'attendant'])
        ->and($service->prices[0]->features[1]->is_included)->toBeFalse()
        ->and($service->prices[1]->pricing_unit)->toBe('hour');
});

test('refuses claimed vendors', function () {
    Vendor::create(['uuid' => 'claimed', 'user_id' => User::factory()->create()->id, 'name' => 'Claimed', 'slug' => 'claimed', 'location' => '']);

    IngressServer::actingAs($this->admin)->tool(CreateService::class, ['vendor_slug' => 'claimed', 'name' => 'Fotobooth', 'category' => 'photobooths'])
        ->assertHasErrors(['claimed']);

    expect(Service::count())->toBe(0);
});

test('refuses unknown vendors', function () {
    IngressServer::actingAs($this->admin)->tool(CreateService::class, ['vendor_slug' => 'unknown', 'name' => 'Fotobooth', 'category' => 'photobooths'])
        ->assertHasErrors(['No vendor has this slug']);
});

test('refuses feature keys outside the category and variable prices without a unit', function () {
    IngressServer::actingAs($this->admin)->tool(CreateService::class, [
        'vendor_slug' => 'fotobooth-utrecht',
        'name' => 'Photography',
        'category' => 'photography',
        'pricing_options' => [
            ['price_in_minor' => 10000, 'pricing_mode' => 'fixed', 'features' => [['feature_key' => 'prints']]],
            ['price_in_minor' => 5000, 'pricing_mode' => 'variable'],
        ],
    ])->assertHasErrors(['feature key is not allowed', 'variable price needs a pricing_unit']);

    expect(Service::count())->toBe(0);
});
