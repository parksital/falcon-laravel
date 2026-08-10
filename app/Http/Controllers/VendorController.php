<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateVendorRequest;
use Illuminate\Http\RedirectResponse;

class VendorController extends Controller
{
    public function update(UpdateVendorRequest $request): RedirectResponse
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        $validated = $request->validated();

        $vendor->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'short_description' => $validated['short_description'] ?? null,
        ]);

        return to_route('overview')->with('success', __('overview.vendor_edit_saved'));
    }
}
