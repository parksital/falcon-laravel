<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Models\BookingPage;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::middleware('guest')->group(function () {});

Route::get('/book/{slug}', function (string $slug) {
    $bookingPage = BookingPage::query()
        ->where('slug', $slug)
        ->where('is_public', true)
        ->with(['products:id,name,description'])
        ->firstOrFail();

    return Inertia::render('PublicBookingPage', [
        'bookingPage' => $bookingPage->only([
            'id',
            'title',
            'description',
            'phone',
            'email',
            'is_public',
            'slug',
        ]),
        'products' => $bookingPage->products->map->only(['id', 'name', 'description']),
    ]);
})->name('booking.public.show');

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return to_route('product.index');
    })->name('home');

    Route::get('/products', function () {
        return Inertia::render('ProductsPage', [
            'products' => Product::query()
                ->latest()
                ->get(['id', 'name', 'description', 'created_at', 'updated_at']),
        ]);
    })->name('product.index');

    Route::patch('/products/{product}', function (Request $request, Product $product) {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $product->update($data);

        return back();
    })->name('product.update');

    Route::delete('/products/{product}', function (Product $product) {
        $product->delete();

        return back();
    })->name('product.destroy');

    Route::get('/booking-page', function () {
        $bookingPage = BookingPage::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->with(['products:id,name'])
            ->first();

        return Inertia::render('AdminBookingPageRead', [
            'bookingPage' => $bookingPage?->only([
                'id',
                'title',
                'description',
                'phone',
                'email',
                'is_public',
                'slug',
            ]),
            'products' => $bookingPage?->products->map->only(['id', 'name']) ?? [],
        ]);
    })->name('booking.index');

    Route::get('/booking-page/edit', function () {
        $bookingPage = BookingPage::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->first();

        return Inertia::render('AdminBookingPage', [
            'bookingPage' => $bookingPage?->only([
                'id',
                'title',
                'description',
                'phone',
                'email',
                'is_public',
                'slug',
            ]),
            'products' => Product::query()
                ->latest()
                ->get(['id', 'name', 'description', 'created_at']),
            'selectedProductIds' => $bookingPage
                ? $bookingPage->products()->pluck('products.id')
                : [],
        ]);
    })->name('booking.edit');

    Route::patch('/booking-page', function (Request $request) {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_public' => ['required', 'boolean'],
            'product_ids' => ['array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $bookingPage = BookingPage::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->first();

        if (! $bookingPage) {
            $slug = Str::slug($data['title']) ?: 'booking-page';
            $baseSlug = $slug;
            $suffix = 1;

            while (BookingPage::query()->where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $suffix;
                $suffix++;
            }

            $bookingPage = BookingPage::create([
                'user_id' => auth()->id(),
                'slug' => $slug,
                ...$data,
            ]);
        } else {
            $bookingPage->update($data);
        }

        $bookingPage->products()->sync($data['product_ids'] ?? []);

        return back();
    })->name('booking.update');
});
