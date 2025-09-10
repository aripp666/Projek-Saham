<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DynamicExcelController;
use App\Http\Controllers\DataModalController;
use App\Http\Controllers\DataSahamController;
use App\Http\Controllers\PdfController;
use App\Http\Controllers\PERDAController;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// ==========================
// 🔹 Dynamic Excel Routes
// ==========================
Route::post('/import-dynamic', [DynamicExcelController::class, 'import']);
Route::get('/get-dynamic-data/{table}', [DynamicExcelController::class, 'getData']);
Route::get('/export-dynamic/{table}', [DynamicExcelController::class, 'export']);
Route::delete('/delete-dynamic/{table}', [DynamicExcelController::class, 'deleteData']);
Route::get('/list-tables', [DynamicExcelController::class, 'listTables']);


// ==========================
// 🔹 Data Saham Routes
// ==========================
Route::post('/data-saham/import', [DataSahamController::class, 'import']);
Route::get('/data-saham', [DataSahamController::class, 'index']);
Route::post('/data-saham', [DataSahamController::class, 'store']);
Route::put('/data-saham/{id}', [DataSahamController::class, 'update']);
Route::delete('/data-saham/{id}', [DataSahamController::class, 'destroy']);


// ==========================
// 🔹 Data Modal Routes
// ==========================
Route::post('/data-modal/import', [DataModalController::class, 'import']);
Route::get('/data-modal', [DataModalController::class, 'index']);
Route::get('/data-modal/tables', [DataModalController::class, 'tables']);
Route::get('/data-modal/export', [DataModalController::class, 'export']);

// CRUD manual row
Route::post('/data-modal/manual', [DataModalController::class, 'store']);
Route::put('/data-modal/{id}', [DataModalController::class, 'update']);
Route::delete('/data-modal/{id}', [DataModalController::class, 'destroy']);



Route::get('/api/data-modal', [DataModalController::class, 'index']);
Route::get('/data-modal', [DataModalController::class, 'index']);


Route::get('/data-saham/export', [DataSahamController::class, 'export']);
Route::get('/data-modal/export', [DataModalController::class, 'export']);


Route::post('/perda/import', [PERDAController::class, 'import']);
Route::get('/perda/last-import', [PERDAController::class, 'lastImport']);

Route::post('/pdf-upload', [PdfController::class, 'upload']);

Route::put('/perda/row/{index}', [PERDAController::class, 'updateRow']);   // update row
Route::delete('/perda/row/{index}', [PERDAController::class, 'deleteRow']); // delete row
Route::post('/perda/row', [PERDAController::class, 'addRow']);             // add row baru
Route::get('/perda/export', [PERDAController::class, 'export']);