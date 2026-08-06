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
            'short_description' => $validated['short_description'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return to_route('overview')->with('success', __('overview.vendor_edit_saved'));
    }
}
