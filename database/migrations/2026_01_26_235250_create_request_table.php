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
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->enum('type', ['leave', 'travel']);
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            
            // Common fields
            $table->date('date_of_request');
            $table->text('comment')->nullable();
            $table->text('reason')->nullable();
            $table->text('purpose')->nullable();
            $table->text('remarks')->nullable();
            
            // Leave specific fields
            $table->time('time_out')->nullable();
            $table->time('expected_time_in')->nullable();
            
            // Travel specific fields
            $table->integer('total_days')->nullable();
            
            // Signature
            // $table->string('signature_path')->nullable();
            // $table->boolean('uses_default_signature')->default(true);
            
            // Timestamps
            $table->timestamps();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            
            // Indexes
            $table->index('request_id');
            $table->index('user_id');
            $table->index('approver_id');
            $table->index('status');
            $table->index('type');
            $table->index('date_of_request');
        });

        // Create travel days table (for travel requests)
        Schema::create('travel_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained()->onDelete('cascade');
            $table->text('place_of_travel')->nullable();
            $table->date('date_from');
            $table->date('date_to');
            $table->enum('transportation', [
                'company_vehicle',
                'personal_vehicle', 
                'public_transport',
                'airline',
                'other'
            ]);
            $table->decimal('per_diem', 10, 2);
            $table->text('notes')->nullable();

            $table->timestamps();
            
            // Indexes
            $table->index('request_id');
            $table->index(['date_from', 'date_to']);
        });

        // Create request history table
        Schema::create('request_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['created', 'updated', 'submitted', 'approved', 'rejected', 'cancelled', 'commented']);
            $table->text('description')->nullable();
            $table->json('changes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('request_id');
            $table->index('user_id');
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_histories');
        Schema::dropIfExists('travel_days');
        Schema::dropIfExists('requests');
    }
};