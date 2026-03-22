<?php

use App\Http\Controllers\Api\GlobalController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RequestController;

// Route::get('/', function () {
//     return view('welcome');
// });


Route::get('/requests/{id}/print', [GlobalController::class, 'printRequest'])->name('requests.print');

// Route::get('/requests/{id}', [RequestController::class, 'show'])->name('requests.show');

// Route::get('/requests/{id}/review', [RequestController::class, 'review'])->name('requests.review');

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');