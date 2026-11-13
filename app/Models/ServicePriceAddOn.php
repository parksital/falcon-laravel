<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePriceAddOn extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_price_id',
        'name',
        'description',
        'price_in_minor',
        'currency',
        'pricing_unit',
        'sort_order',
    ];

    public function price(): BelongsTo
    {
        return $this->belongsTo(ServicePrice::class, 'service_price_id');
    }
}
