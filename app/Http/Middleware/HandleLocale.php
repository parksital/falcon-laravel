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
        $supportedLocales = config('app.supported_locales');
        $preferredLocale = $request->user()?->preferred_locale;
        $cookieLocale = $request->cookie('locale');

        if (is_string($preferredLocale) && in_array($preferredLocale, $supportedLocales, true)) {
            $locale = $preferredLocale;
        } elseif (is_string($cookieLocale) && in_array($cookieLocale, $supportedLocales, true)) {
            $locale = $cookieLocale;
        } else {
            $locale = config('app.locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
