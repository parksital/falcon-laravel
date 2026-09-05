<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('service_prices', function (Blueprint $table) {
            $table->string('currency', 3)->default('EUR');
            $table->string('pricing_mode')->default('fixed');
            $table->string('pricing_unit')->nullable();
            $table->index(['pricing_mode', 'pricing_unit']);
            $table->dropColumn('pricing_type');
        });

        Schema::table('service_price_features', function (Blueprint $table) {
            $table->string('label')->nullable()->after('feature_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_price_features', function (Blueprint $table) {
            $table->dropColumn('label');
        });

        Schema::table('service_prices', function (Blueprint $table) {
            $table->string('pricing_type')->default('package');
            $table->dropIndex(['pricing_mode', 'pricing_unit']);
            $table->dropColumn([
                'currency',
                'pricing_mode',
                'pricing_unit',
            ]);
        });
    }
};
