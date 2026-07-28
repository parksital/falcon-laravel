<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    /**
     * Update the current locale.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(config('app.supported_locales'))],
        ]);

        $locale = $validated['locale'];

        $request->user()?->update([
            'preferred_locale' => $locale,
        ]);

        app()->setLocale($locale);

        return back()->withCookie(cookie(
            name: 'locale',
            value: $locale,
            minutes: 60 * 24 * 365,
            sameSite: 'lax',
        ));
    }
}
