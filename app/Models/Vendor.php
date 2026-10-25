<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'name',
        'slug',
        'logo_path',
        'location',
        'short_description',
        'contact_email',
        'contact_phone',
        'website_url',
        'created_via',
        'created_by_admin_id',
        'source_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isClaimed(): bool
    {
        return $this->user_id !== null;
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
