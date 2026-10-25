<?php

namespace App\Actions;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CreateVendor
{
    /**
     * Get the validation rules used to create a vendor.
     *
     * @return array<string, array<mixed>>
     */
    public static function rules(): array
    {
        return [
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
        ];
    }

    /**
     * Create a vendor from validated input. A vendor without an owner is unclaimed.
     *
     * @param  array<string, mixed>  $validated
     */
    public function handle(?User $owner, array $validated): Vendor
    {
        $vendorUuid = (string) Str::uuid();
        $logoPath = null;
        if (isset($validated['logo'])) {
            $extension = $validated['logo']->extension();
            $filename = Str::uuid().".{$extension}";

            $logoPath = Storage::disk('r2')->putFileAs("vendors/$vendorUuid/logo", $validated['logo'], $filename, 'public');
        }

        return Vendor::create([
            'uuid' => $vendorUuid,
            'user_id' => $owner?->id,
            'name' => $validated['business_name'],
            'slug' => $validated['slug'],
            'logo_path' => $logoPath,
            'location' => '',
        ]);
    }
}
