<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePriceFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_price_id',
        'feature_key',
        'is_included',
        'value',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_included' => 'boolean',
        ];
    }

    public function price(): BelongsTo
    {
        return $this->belongsTo(ServicePrice::class, 'service_price_id');
    }
}
