<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\External;
use Illuminate\Support\Facades\Storage;

class ExternalController extends Controller
{
    // Ambil semua data (API)
    public function index()
    {
        return response()->json(External::latest()->get());
    }

    // Upload baru
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'file'  => 'required|mimes:pdf|max:10240', // max 10MB
        ]);

        $path = $request->file('file')->store('externals', 'public');

        $pdf = External::create([
            'judul' => $request->judul,
            'file'  => $path,
        ]);

        return response()->json($pdf, 201);
    }

    // Detail
    public function show($id)
    {
        $pdf = External::findOrFail($id);
        return inertia('ExternalDetail', [
            'pdf' => $pdf
        ]);
    }

    // Hapus
    public function destroy($id)
    {
        $pdf = External::findOrFail($id);

        if ($pdf->file && Storage::disk('public')->exists($pdf->file)) {
            Storage::disk('public')->delete($pdf->file);
        }

        $pdf->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
