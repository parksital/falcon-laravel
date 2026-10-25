<?php

namespace App\Http\Controllers;

use App\Actions\CreateVendor;
use App\Http\Requests\UpdateVendorRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VendorController extends Controller
{
    public function store(Request $request, CreateVendor $createVendor): RedirectResponse
    {
        if ($request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        $validated = $request->validate(CreateVendor::rules(), [
            'slug.not_in' => __('vendor-onboarding.booking_page_url_unavailable'),
            'slug.regex' => __('vendor-onboarding.booking_page_url_format'),
            'slug.unique' => __('vendor-onboarding.booking_page_url_unavailable'),
        ]);

        $createVendor->handle($request->user(), $validated);

        return to_route('overview');
    }

    public function update(UpdateVendorRequest $request): RedirectResponse
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return to_route('onboarding');
        }

        $validated = $request->validated();
        $logoPath = $vendor->logo_path;

        if ($request->hasFile('logo')) {
            $extension = $validated['logo']->extension();
            $filename = Str::uuid().".{$extension}";
            $logoPath = Storage::disk('r2')->putFileAs("vendors/{$vendor->uuid}/logo", $validated['logo'], $filename, 'public');

            if ($vendor->logo_path && $vendor->logo_path !== $logoPath) {
                Storage::disk('r2')->delete($vendor->logo_path);
            }
        } elseif ($request->exists('logo')) {
            if ($vendor->logo_path) {
                Storage::disk('r2')->delete($vendor->logo_path);
            }

            $logoPath = null;
        }

        $vendor->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'logo_path' => $logoPath,
            'short_description' => $validated['short_description'] ?? null,
        ]);

        return to_route('overview')->with('success', __('overview.vendor_edit_saved'));
    }
}
