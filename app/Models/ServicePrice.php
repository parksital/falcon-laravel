<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServicePrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'description',
        'price_in_minor',
        'currency',
        'pricing_mode',
        'pricing_unit',
        'sort_order',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function features(): HasMany
    {
        return $this->hasMany(ServicePriceFeature::class)->orderBy('sort_order');
    }
}
