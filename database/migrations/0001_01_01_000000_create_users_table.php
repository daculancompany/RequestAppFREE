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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('title',30)->nullable(); 
            $table->string('suffix',20)->nullable(); 
            $table->string('name')->nullable();
            $table->string('fname')->nullable();
            $table->string('mname')->nullable();
            $table->string('lname')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['member', 'admin','super-admin'])->default('member');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->string('avatar')->nullable();
            $table->bigInteger('branch_id')->unsigned()->nullable(); 
            $table->bigInteger('department_id')->unsigned()->nullable(); 
            $table->bigInteger('position_id')->unsigned()->nullable(); 
            $table->text('address')->nullable();
            $table->string('esignature')->nullable();
            $table->foreign('branch_id')->references('id')->on('branch')->unsigned()->onDelete('cascade'); 
            $table->foreign('department_id')->references('id')->on('departments')->unsigned()->onDelete('cascade'); 
            $table->foreign('position_id')->references('id')->on('positions')->unsigned()->onDelete('cascade'); 
            //$table->json('settings')->nullable();
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
