<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DetailModalController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
// Route Dashboard (tanpa autentikasi)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// Route untuk Data.jsx
Route::get('/data', function () {
    return Inertia::render('Data'); // pastikan nama file Data.jsx di resources/js/Pages
});

// Halaman upload Data Saham
Route::get('/data-saham', function () {
    return Inertia::render('DataSaham');
})->name('data.saham');

// Halaman upload Data Modal
Route::get('/data-modal', function () {
    return Inertia::render('DataModal');
})->name('data.modal');

Route::get('/PSaham', function () {
    return Inertia::render('PSaham'); // PSaham.jsx ada di resources/js/Pages/PSaham.jsx
});
Route::get('/DetailModal', function () {
    return Inertia::render('DetailModal'); // DetailModal.jsx ada di resources/js/Pages/DetailModal.jsx
});
Route::get('/Perda', function () {
    return Inertia::render('Perda'); // PModal.jsx ada di resources/js/Pages/PModal.jsx
});

Route::get('/detail-modal', [DetailModalController::class, 'index']);


Route::get('/Pdf', function () {
    return Inertia::render('PdfUpload'); // Pdf.jsx ada di resources/js/Pages/Pdf.jsx
});


// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
