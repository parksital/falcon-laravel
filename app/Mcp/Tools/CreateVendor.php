<?php

namespace App\Mcp\Tools;

use App\Models\Vendor;
use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Psr7\UriResolver;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Http\File;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use RuntimeException;
use Symfony\Component\HttpFoundation\IpUtils;

#[Description(<<<'TEXT'
Create an unclaimed vendor (a business without an owner account). Check with `search-vendors` first that the business and slug aren't already in the catalog.

The slug becomes the vendor's public URL path and must follow the `vendor_slug` rules from `get-catalog-schema`.

Pass `logo_url` to import the business logo. If the logo can't be imported, the vendor is still created without it and `logo_error` says why.

Returns the new vendor's ID, slug and public URL.
TEXT)]
class CreateVendor extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/',
                Rule::notIn(config('reserved_vendor_slugs')),
                Rule::unique('vendors', 'slug'),
            ],
            'location' => ['nullable', 'string', 'max:120'],
            'short_description' => ['nullable', 'string', 'max:2000'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'website_url' => ['nullable', 'url:http,https', 'max:2048'],
            'logo_url' => ['nullable', 'url:http,https', 'max:2048'],
        ], [
            'slug.regex' => 'The slug may only contain lowercase letters, numbers and underscores, separated by single hyphens.',
            'slug.not_in' => 'This slug is reserved. Choose another slug.',
            'slug.unique' => 'This slug is already taken by another vendor. Choose another slug.',
        ]);

        $vendorUuid = (string) Str::uuid();
        $logoPath = null;
        $logoError = null;
        if (isset($validated['logo_url'])) {
            try {
                $logoPath = $this->storeLogo($validated['logo_url'], $vendorUuid);
            } catch (RuntimeException $e) {
                $logoError = $e->getMessage();
            }
        }

        $vendor = Vendor::create([
            'uuid' => $vendorUuid,
            'user_id' => null,
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'logo_path' => $logoPath,
            'location' => $validated['location'] ?? '',
            'short_description' => $validated['short_description'] ?? null,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'website_url' => $validated['website_url'] ?? null,
        ]);

        return Response::structured(array_filter([
            'id' => $vendor->id,
            'slug' => $vendor->slug,
            'public_url' => route('public.booking.show', $vendor->slug),
            'logo_error' => $logoError,
        ]));
    }

    /**
     * Download the logo, check it the same way as the web logo upload and store it on R2.
     *
     * @throws RuntimeException with the reason when the logo can't be imported.
     */
    private function storeLogo(string $url, string $vendorUuid): string
    {
        $temporaryPath = tempnam(sys_get_temp_dir(), 'logo');

        try {
            $this->download($url, $temporaryPath);

            $logo = new File($temporaryPath);
            $validator = Validator::make(['logo' => $logo], ['logo' => ['image', 'max:2048']], [
                'logo.image' => 'The logo must be a JPG, PNG, GIF, BMP or WebP image.',
                'logo.max' => 'The logo must not be larger than 2 MB.',
            ]);
            if ($validator->fails()) {
                throw new RuntimeException($validator->errors()->first('logo'));
            }

            $filename = Str::uuid().".{$logo->guessExtension()}";
            $logoPath = Storage::disk('r2')->putFileAs("vendors/$vendorUuid/logo", $logo, $filename, 'public');
            if (! $logoPath) {
                throw new RuntimeException('The logo could not be stored.');
            }

            return $logoPath;
        } finally {
            @unlink($temporaryPath);
        }
    }

    /**
     * Download a public URL to a file, refusing private and internal addresses on every redirect.
     */
    private function download(string $url, string $path): void
    {
        for ($redirects = 0; $redirects <= 3; $redirects++) {
            $uri = new Uri($url);
            if (! in_array($uri->getScheme(), ['http', 'https']) || $uri->getHost() === '') {
                throw new RuntimeException("The logo URL $url must start with http:// or https://.");
            }

            $host = trim($uri->getHost(), '[]');
            $ip = $this->resolvePublicIp($host);
            $port = $uri->getPort() ?? ($uri->getScheme() === 'https' ? 443 : 80);

            try {
                $response = Http::withUserAgent('Huurmaar logo importer')->timeout(10)->connectTimeout(5)->withoutRedirecting()->withOptions([
                    'sink' => $path,
                    'curl' => [
                        // Connect to the address we checked, so DNS can't point the request elsewhere.
                        CURLOPT_RESOLVE => ["$host:$port:".(str_contains($ip, ':') ? "[$ip]" : $ip)],
                        CURLOPT_MAXFILESIZE_LARGE => 2048 * 1024,
                    ],
                ])->get($url);
            } catch (HttpClientException $e) {
                throw new RuntimeException("The logo could not be downloaded from $url: {$e->getMessage()}");
            }

            if ($response->redirect() && $response->header('Location')) {
                $url = (string) UriResolver::resolve($uri, new Uri($response->header('Location')));

                continue;
            }

            if (! $response->successful()) {
                throw new RuntimeException("The logo could not be downloaded from $url: the server responded with HTTP {$response->status()}.");
            }

            return;
        }

        throw new RuntimeException('The logo URL redirects too many times.');
    }

    /**
     * Resolve a host to an IP address, refusing localhost, private networks and cloud metadata endpoints.
     */
    private function resolvePublicIp(string $host): string
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            $ips = [$host];
        } else {
            $records = @dns_get_record($host, DNS_A | DNS_AAAA) ?: [];
            $ips = array_map(fn (array $record) => $record['ip'] ?? $record['ipv6'], $records);
        }

        if ($ips === []) {
            throw new RuntimeException("The logo host $host could not be found.");
        }

        foreach ($ips as $ip) {
            if (IpUtils::isPrivateIp($ip)) {
                throw new RuntimeException("The logo host $host points to a private or internal address, which is not allowed.");
            }
        }

        return $ips[0];
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('The business name.')->max(120)->required(),
            'slug' => $schema->string()->description('The public URL path, such as "fotobooth-utrecht".')->max(120)->required(),
            'location' => $schema->string()->description('The city or region the business operates from, such as "Utrecht".')->max(120),
            'short_description' => $schema->string()->description('A short description of the business.')->max(2000),
            'contact_email' => $schema->string()->description('The business contact email address.'),
            'contact_phone' => $schema->string()->description('The business contact phone number.'),
            'website_url' => $schema->string()->description('The business website, starting with http:// or https://.'),
            'logo_url' => $schema->string()->description('A public URL of the business logo, starting with http:// or https://. Must be a JPG, PNG, GIF, BMP or WebP image of at most 2 MB.'),
        ];
    }
}
