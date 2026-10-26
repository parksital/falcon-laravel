<?php

namespace App\Providers;

use App\Models\Admin;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Nightwatch\Facades\Nightwatch;
use Laravel\Nightwatch\Records\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Untyped on purpose: the gate also receives vendor users, which must be refused rather than throw.
        Gate::define('ingest', fn ($user) => $user instanceof Admin);

        Nightwatch::redactRequests(function (Request $request): void {
            if ($request->routePath === '/mcp/{token}') {
                $request->url = preg_replace('#/mcp/[^/?]+#', '/mcp/[redacted]', $request->url);
            }
        });
    }
}
