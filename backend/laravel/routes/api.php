<?php

use App\Http\Controllers\InvoiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserAuthController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('login', [UserAuthController::class, 'login']);
Route::get('test', [UserAuthController::class, 'test']);
Route::post('logout', [UserAuthController::class, 'logout'])->middleware('auth:sanctum');
Route::resource('invoice',InvoiceController::class)->middleware('auth:sanctum');
Route::post('user',[UserAuthController::class, 'createUser']);