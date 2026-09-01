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
        Schema::create('service_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('price_in_minor');
            $table->string('pricing_type');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['service_id', 'sort_order']);
        });

        Schema::create('service_price_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_price_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('feature_key');
            $table->boolean('is_included')->default(true);
            $table->string('value')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['service_price_id', 'sort_order']);
            $table->index(['feature_key', 'is_included']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_price_features');
        Schema::dropIfExists('service_prices');
    }
};
