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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('category')->index();
            $table->text('description')->nullable();
            $table->unsignedInteger('price_in_minor')->nullable();
            $table->string('unit')->nullable();
            $table->boolean('is_public')->default(false)->index();
            $table->timestamps();

            $table->unique(['vendor_id', 'slug']);
            $table->index(['vendor_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
