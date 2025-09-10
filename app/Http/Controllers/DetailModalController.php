<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Saham;

class DetailModalController extends Controller
{
    public function index(Request $request)
    {
        $kabupaten = $request->query('kabupaten'); // Ambil query string

        // Ambil data modal sesuai nama pemegang saham
        $data = Saham::where('nama_pemegang_saham', $kabupaten)->get();

        return Inertia::render('DetailModal', [
            'data' => $data,
            'kabupaten' => $kabupaten
        ]);
    }
}
