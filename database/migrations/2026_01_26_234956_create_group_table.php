<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('created_by')->unsigned()->nullable();
            $table->string('group_name');
            $table->string('group_color',30);
            $table->string('group_code',30);
            $table->string('group_image')->nullable();
            $table->enum('group_type', ['normal', 'legal', 'others'])->default('normal');
            $table->timestamps();
            $table->foreign('created_by')->references('id')->on('users')->unsigned()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group');
    }
};
