<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Merchant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'business_type',
        'contact_email',
        'short_description',
        'is_public',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
