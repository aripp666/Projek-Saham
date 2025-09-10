<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use thiagoalessio\TesseractOCR\TesseractOCR;
use Spatie\PdfToText\Pdf;

class PdfController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'pdf' => 'required|mimes:pdf|max:20480', // max 20MB
            'lang' => 'nullable|string'
        ]);

        $pdfFile = $request->file('pdf');
        $filePath = $pdfFile->store('pdfs', 'public');
        $fullPath = storage_path('app/public/' . $filePath);

        // Ambil bahasa (default: ind)
        $lang = $request->input('lang', 'ind');

        try {
            // Coba baca pakai spatie (kalau PDF text-based)
            $text = Pdf::getText($fullPath);
            if (trim($text) !== '') {
                return response()->json([
                    'status' => 'success',
                    'source' => 'pdf-to-text',
                    'text' => $text
                ]);
            }

            // Kalau kosong, fallback ke OCR (scan/gambar)
            $text = (new TesseractOCR($fullPath))
                ->lang($lang)
                ->run();

            return response()->json([
                'status' => 'success',
                'source' => 'ocr',
                'text' => $text
            ]);

        } catch (\Exception $e) {
    return response()->json([
        'status' => 'error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ], 500);
}


    }
}
