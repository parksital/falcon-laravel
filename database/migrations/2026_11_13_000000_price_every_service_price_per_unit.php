<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('service_prices')
            ->where('pricing_mode', 'fixed')
            ->update(['pricing_unit' => 'booking']);

        Schema::table('service_prices', function (Blueprint $table) {
            $table->dropIndex(['pricing_mode', 'pricing_unit']);
            $table->dropColumn('pricing_mode');
            $table->string('pricing_unit')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_prices', function (Blueprint $table) {
            $table->string('pricing_mode')->default('fixed');
            $table->string('pricing_unit')->nullable()->change();
            $table->index(['pricing_mode', 'pricing_unit']);
        });

        DB::table('service_prices')
            ->where('pricing_unit', 'booking')
            ->update(['pricing_mode' => 'fixed', 'pricing_unit' => null]);

        DB::table('service_prices')
            ->whereNotNull('pricing_unit')
            ->update(['pricing_mode' => 'variable']);
    }
};
