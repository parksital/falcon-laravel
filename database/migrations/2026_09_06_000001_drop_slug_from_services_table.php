<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropUnique('services_vendor_id_slug_unique');
            $table->dropColumn('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        DB::table('services')
            ->select(['id', 'name', 'vendor_id'])
            ->orderBy('id')
            ->each(function (object $service) {
                $baseSlug = Str::slug($service->name) ?: 'service';
                $slug = $baseSlug;
                $suffix = 1;

                while (DB::table('services')
                    ->where('vendor_id', $service->vendor_id)
                    ->where('slug', $slug)
                    ->where('id', '!=', $service->id)
                    ->exists()) {
                    $slug = $baseSlug.'-'.$suffix;
                    $suffix++;
                }

                DB::table('services')
                    ->where('id', $service->id)
                    ->update(['slug' => $slug]);
            });

        Schema::table('services', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
            $table->unique(['vendor_id', 'slug']);
        });
    }
};
