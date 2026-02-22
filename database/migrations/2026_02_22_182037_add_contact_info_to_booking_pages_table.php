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
        Schema::table('booking_pages', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('description');
            $table->string('email')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_pages', function (Blueprint $table) {
            $table->dropColumn(['phone', 'email']);
        });
    }
};
