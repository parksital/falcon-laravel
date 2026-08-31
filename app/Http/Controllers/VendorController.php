<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class VendorController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->vendor()->exists()) {
            return to_route('onboarding');
        }

        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:120'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/',
                Rule::notIn(config('reserved_vendor_slugs')),
                Rule::unique('vendors', 'slug'),
            ],
        ], [
            'slug.not_in' => __('vendor-onboarding.booking_page_url_unavailable'),
            'slug.regex' => __('vendor-onboarding.booking_page_url_format'),
            'slug.unique' => __('vendor-onboarding.booking_page_url_unavailable'),
        ]);

        $logoPath = null;
        if (isset($validated['logo'])) {
            $logoPath = Storage::disk('r2')->putFile('vendor-logos', $validated['logo'], 'public');
        }

        Vendor::create([
            'uuid' => Str::uuid(),
            'user_id' => $request->user()->id,
            'name' => $validated['business_name'],
            'slug' => $validated['slug'],
            'logo_path' => $logoPath,
            'location' => '',
        ]);

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
            if ($vendor->logo_path) {
                Storage::disk('r2')->delete($vendor->logo_path);
            }

            $logoPath = Storage::disk('r2')->putFile('vendor-logos', $validated['logo'], 'public');
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
