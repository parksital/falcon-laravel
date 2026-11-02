<?php

namespace App\Mcp\Tools;

use App\Models\Service;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Http\UploadedFile;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description(<<<'TEXT'
Add an image, uploaded through `request-service-media-upload`, to a service of an unclaimed vendor. Claimed vendors manage their own services, so this tool refuses them.

The image is shown after the service's existing images. A service has at most 3 images. The file must be a JPG, PNG, GIF, BMP or WebP image of at most 4096 KB. A file that fails this check is deleted; request a new upload to try again.

Returns the image URL and the service's public URL.
TEXT)]
class AddServiceMedia extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        $validated = $request->validate([
            'service_public_id' => ['required', 'string', Rule::exists('services', 'public_id')],
            'upload_key' => ['required', 'string'],
        ], [
            'service_public_id.exists' => 'No service has this public ID. Use the public_id returned by create-service.',
        ]);

        $service = Service::query()->with('vendor')->where('public_id', $validated['service_public_id'])->firstOrFail();
        $vendor = $service->vendor;

        if ($vendor->isClaimed()) {
            return Response::error("The vendor \"{$vendor->slug}\" is claimed by its owner, who manages its services. Images can only be added to services of unclaimed vendors.");
        }

        $uploadKey = $validated['upload_key'];

        if (! Str::isUuid(Str::after($uploadKey, "service-media-uploads/{$service->uuid}/"))) {
            return Response::error("This upload_key does not belong to the service \"{$service->public_id}\". Use the upload_key from request-service-media-upload for this service.");
        }

        if (! Storage::disk('r2')->exists($uploadKey)) {
            return Response::error('No file was uploaded to this upload_key. Upload the image to the upload_url first, or request a new upload if it expired.');
        }

        if ($service->media()->count() >= 3) {
            Storage::disk('r2')->delete($uploadKey);

            return Response::error("The service \"{$service->public_id}\" already has 3 images, the maximum. The upload was deleted.");
        }

        $mediaFile = tmpfile();
        stream_copy_to_stream(Storage::disk('r2')->readStream($uploadKey), $mediaFile);
        $media = new UploadedFile(stream_get_meta_data($mediaFile)['uri'], basename($uploadKey), test: true);

        $validator = Validator::make(['media' => $media], [
            'media' => ['image', 'max:4096'],
        ], [
            'media.image' => 'The uploaded file is not a JPG, PNG, GIF, BMP or WebP image.',
            'media.max' => 'The uploaded file is larger than 4096 KB.',
        ]);

        if ($validator->fails()) {
            Storage::disk('r2')->delete($uploadKey);

            return Response::error($validator->errors()->first('media').' The upload was deleted. Request a new upload to try again.');
        }

        $filename = Str::uuid().".{$media->extension()}";
        $mediaPath = Storage::disk('r2')->putFileAs("vendors/{$vendor->uuid}/services/{$service->uuid}/images", $media, $filename, 'public');

        if (! $mediaPath) {
            return Response::error('The image could not be stored. Try add-service-media again.');
        }

        Storage::disk('r2')->delete($uploadKey);

        $service->media()->create([
            'path' => $mediaPath,
            'sort_order' => ($service->media()->max('sort_order') ?? -1) + 1,
        ]);

        return Response::structured([
            'media_url' => Storage::disk('r2')->url($mediaPath),
            'public_url' => route('public.booking.service.show', [$vendor->slug, $service->public_id]),
        ]);
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'service_public_id' => $schema->string()->description('The public ID of the service to add the image to, like svc_xxxxxxxxxx.')->required(),
            'upload_key' => $schema->string()->description('The upload_key returned by request-service-media-upload.')->required(),
        ];
    }
}
