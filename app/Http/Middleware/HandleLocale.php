<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $preferredLocale = $request->user()?->preferred_locale;

        $isSupported = is_string($preferredLocale) && in_array($preferredLocale, config('app.supported_locales'), true);

        $locale = $isSupported ? $preferredLocale : config('app.locale');

        app()->setLocale($locale);

        return $next($request);
    }
}
