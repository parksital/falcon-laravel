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
        Schema::table('vendors', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('website_url', 2048)->nullable();
            $table->string('created_via')->default('signup');
            $table->foreignId('created_by_admin_id')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();
            $table->string('source_url', 2048)->nullable();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('source_url', 2048)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('source_url');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by_admin_id');
            $table->dropColumn([
                'contact_email',
                'contact_phone',
                'website_url',
                'created_via',
                'source_url',
            ]);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
