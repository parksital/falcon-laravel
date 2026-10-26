<?php

use App\Mcp\Servers\IngressServer;
use App\Mcp\Tools\CreateVendor;
use App\Models\Admin;
use App\Models\Vendor;

beforeEach(function () {
    $this->admin = Admin::create(['name' => 'Founder', 'email' => 'founder@example.com', 'password' => 'password']);
});

test('creates an unclaimed vendor', function () {
    IngressServer::actingAs($this->admin)->tool(CreateVendor::class, ['name' => 'Fotobooth Utrecht', 'slug' => 'fotobooth-utrecht', 'location' => 'Utrecht'])
        ->assertOk()
        ->assertSee(route('public.booking.show', 'fotobooth-utrecht'));

    $vendor = Vendor::where('slug', 'fotobooth-utrecht')->firstOrFail();

    expect($vendor->isClaimed())->toBeFalse()
        ->and($vendor->name)->toBe('Fotobooth Utrecht')
        ->and($vendor->location)->toBe('Utrecht');
});

test('refuses slugs that are taken, reserved or badly formatted', function (string $slug, string $error) {
    Vendor::create(['uuid' => 'existing', 'name' => 'Existing', 'slug' => 'taken', 'location' => '']);

    IngressServer::actingAs($this->admin)->tool(CreateVendor::class, ['name' => 'Fotobooth', 'slug' => $slug])
        ->assertHasErrors([$error]);
})->with([
    'taken' => ['taken', 'already taken'],
    'reserved' => ['admin', 'reserved'],
    'badly formatted' => ['Foto Booth', 'lowercase letters'],
]);
