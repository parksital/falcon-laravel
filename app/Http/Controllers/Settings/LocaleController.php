<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    /**
     * Update the user's preferred locale.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferred_locale' => ['required', 'string', Rule::in(config('app.supported_locales'))],
        ]);

        $request->user()->update($validated);

        app()->setLocale($validated['preferred_locale']);

        return back();
    }
}
