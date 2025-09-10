<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Models\Perda;
use App\Exports\PerdaExport;
use Maatwebsite\Excel\Facades\Excel;
class PERDAController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();

        // Ambil judul baris 4 & 5
        $judulRow4 = [];
        foreach (range('B', 'J') as $col) {
            $judulRow4[] = $sheet->getCell($col . '4')->getValue();
        }
        $judulRow5 = [];
        foreach (range('B', 'J') as $col) {
            $judulRow5[] = $sheet->getCell($col . '5')->getValue();
        }

        $judul = implode(' | ', array_filter($judulRow4))
               . ' - ' . implode(' | ', array_filter($judulRow5));

        // Ambil data mulai baris 6
        $data = [];
        foreach ($sheet->getRowIterator(6) as $row) {
            $cellIterator = $row->getCellIterator('B', 'J');
            $cellIterator->setIterateOnlyExistingCells(false);

            $rowData = [];
            foreach ($cellIterator as $cell) {
                $rowData[] = $cell->getValue();
            }

            if (!empty(array_filter($rowData))) {
                $data[] = $rowData;
            }
        }

        // Simpan ke DB (hapus data lama)
        Perda::truncate();
        Perda::create([
            'judul' => $judul,
            'data'  => $data,
        ]);

        return response()->json([
            'success' => true,
            'judul'   => $judul,
            'data'    => $data,
        ]);
    }

    public function lastImport()
    {
        $perda = Perda::latest()->first();
        if (!$perda) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada data import',
            ]);
        }

        return response()->json([
            'success' => true,
            'judul'   => $perda->judul,
            'data'    => $perda->data,
        ]);
    }

    // ----------------------------
    // CRUD Row PERDA
    // ----------------------------

    // Tambah row di index tertentu (index opsional)
    public function addRow(Request $request)
    {
        $request->validate([
            'row'   => 'required|array',
            'index' => 'nullable|integer|min:0',
        ]);

        $perda = Perda::latest()->first();
        if (!$perda) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $data = $perda->data;
        $index = $request->index ?? count($data); // default tambah di akhir

        if ($index > count($data)) $index = count($data);

        array_splice($data, $index, 0, [$request->row]); // sisipkan row baru
        $perda->update(['data' => $data]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    // Update row berdasarkan index
    public function updateRow(Request $request, $index)
    {
        $request->validate([
            'row' => 'required|array',
        ]);

        $perda = Perda::latest()->first();
        if (!$perda) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $data = $perda->data;
        if (!isset($data[$index])) return response()->json(['success' => false, 'message' => 'Index row salah'], 400);

        $data[$index] = $request->row;
        $perda->update(['data' => $data]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    // Hapus row berdasarkan index
    public function deleteRow($index)
    {
        $perda = Perda::latest()->first();
        if (!$perda) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $data = $perda->data;
        if (!isset($data[$index])) return response()->json(['success' => false, 'message' => 'Index row salah'], 400);

        array_splice($data, $index, 1);
        $perda->update(['data' => $data]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function export()
{
    return Excel::download(new PerdaExport, 'perda.xlsx');
}
}
