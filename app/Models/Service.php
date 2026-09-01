<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'name',
        'slug',
        'category',
        'description',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function customCategory(): HasOne
    {
        return $this->hasOne(ServiceCustomCategory::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ServicePrice::class)->orderBy('sort_order');
    }

    public function media(): HasMany
    {
        return $this->hasMany(ServiceMedia::class)->orderBy('sort_order');
    }
}
