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
            $table->string('contact_email')->nullable()->after('short_description');
            $table->string('contact_phone')->nullable()->after('contact_email');
            $table->string('website_url')->nullable()->after('contact_phone');
            $table->string('created_via')->default('signup')->after('website_url');
            $table->foreignId('created_by_admin_id')
                ->nullable()
                ->after('created_via')
                ->constrained('admins')
                ->nullOnDelete();
            $table->string('source_url', 2048)->nullable()->after('created_by_admin_id');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('source_url', 2048)->nullable()->after('is_public');
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
