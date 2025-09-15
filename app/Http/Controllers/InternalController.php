<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Internal;
use Illuminate\Support\Facades\Storage;

class InternalController extends Controller
{
    // Ambil semua PDF
    public function index()
    {
        return response()->json(Internal::latest()->get());
    }

    // Upload PDF baru
   public function store(Request $request)
{
    try {
        $request->validate([
            'judul' => 'required|string|max:255',
            'file' => 'required|mimes:pdf|max:5120',
        ]);

        // debug isi request
        \Log::info('Request data:', $request->all());
        \Log::info('File:', [$request->file('file')]);

        $path = $request->file('file')->store('internals', 'public');

        $pdf = Internal::create([
            'judul' => $request->judul,
            'file' => $path,
        ]);

        return response()->json($pdf, 201);
    } catch (\Exception $e) {
        \Log::error('Upload gagal: '.$e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    // Hapus PDF
    public function destroy($id)
    {
        $pdf = Internal::findOrFail($id);

        // Hapus file dari storage
        if ($pdf->file && Storage::disk('public')->exists($pdf->file)) {
            Storage::disk('public')->delete($pdf->file);
        }

        // Hapus record dari database
        $pdf->delete();

        return response()->json(['message' => 'PDF berhasil dihapus']);
    }
    public function show($id)
{
    $pdf = Internal::findOrFail($id);
    return inertia('InternalDetail', [
        'pdf' => $pdf
    ]);
}

}
