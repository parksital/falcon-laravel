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
            $table->string('public_id')->nullable()->unique()->after('uuid');
        });

        $publicIds = [];

        DB::table('services')
            ->select('id')
            ->orderBy('id')
            ->each(function (object $service) use (&$publicIds) {
                do {
                    $publicId = 'svc_'.Str::lower(Str::random(10));
                } while (in_array($publicId, $publicIds, true));

                DB::table('services')
                    ->where('id', $service->id)
                    ->update(['public_id' => $publicId]);

                $publicIds[] = $publicId;
            });

        Schema::table('services', function (Blueprint $table) {
            $table->string('public_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropUnique(['public_id']);
            $table->dropColumn('public_id');
        });
    }
};
