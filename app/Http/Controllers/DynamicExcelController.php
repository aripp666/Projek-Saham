<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Illuminate\Support\Facades\Log;

class DynamicExcelController extends Controller
{
    /**
     * Import Excel dan buat/update tabel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls',
            'table_name' => 'required|string'
        ]);

        $file = $request->file('file');
        $tableName = Str::snake($request->table_name);

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $allData = [];
            $allHeaders = [];

            foreach ($spreadsheet->getWorksheetIterator() as $sheet) {
                $sheetName = $sheet->getTitle();
                $rows = $sheet->toArray(null, true, true, true);

                if (count($rows) < 2) continue;

                // Ambil header dari baris pertama
                $rawHeader = array_values($rows[1]);
                $header = [];
                foreach ($rawHeader as $i => $col) {
                    $colName = strtolower(preg_replace('/[^A-Za-z0-9]/', '_', trim((string)$col)));
                    $header[] = $colName !== '' ? $colName : "column_" . ($i + 1);
                }

                $allHeaders = array_unique(array_merge($allHeaders, $header));

                // Data isi
                $dataRows = array_slice($rows, 1);
                foreach ($dataRows as $row) {
                    $rowData = [];
                    foreach ($header as $key => $column) {
                        $value = array_values($row)[$key] ?? null;
                        $rowData[$column] = is_string($value) ? trim($value) : ($value !== null ? (string)$value : null);
                    }
                    if (!empty(array_filter($rowData))) {
                        $rowData['sheet_name'] = $sheetName;
                        $allData[] = $rowData;
                    }
                }
            }

            if (empty($allHeaders)) {
                return response()->json(['status' => 'error', 'message' => 'Header Excel tidak ditemukan'], 400);
            }

            // Buat tabel kalau belum ada
            if (!Schema::hasTable($tableName)) {
                Schema::create($tableName, function (Blueprint $table) use ($allHeaders) {
                    $table->id();
                    foreach ($allHeaders as $column) {
                        $table->text($column)->nullable();
                    }
                    $table->string("sheet_name")->nullable();
                    $table->timestamps();
                });
            }

            // Hapus data lama
            if (DB::table($tableName)->count() > 0) {
                DB::table($tableName)->truncate();
            }

            // Insert baru
            foreach (array_chunk($allData, 500) as $chunk) {
                DB::table($tableName)->insert($chunk);
            }

            return response()->json([
                'status' => 'success',
                'message' => "Data berhasil diimport ke tabel $tableName",
                'rows' => count($allData)
            ]);
        } catch (\Exception $e) {
            Log::error('Import Excel error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat import Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ambil semua data dari tabel
     */
    public function getData($tableName)
    {
        $tableName = Str::snake($tableName);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['status' => 'error', 'data' => []], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => DB::table($tableName)->get()
        ]);
    }

    /**
     * Export data ke Excel
     */
    public function export($tableName)
    {
        $tableName = Str::snake($tableName);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['status' => 'error', 'message' => 'Tabel tidak ada'], 404);
        }

        $data = DB::table($tableName)->get();

        $export = new class($data) implements FromCollection {
            protected $data;
            public function __construct($data) { $this->data = $data; }
            public function collection() { return collect($this->data->toArray()); }
        };

        return Excel::download($export, "$tableName.xlsx");
    }

    /**
     * Hapus seluruh data dalam tabel
     */
    public function deleteData($tableName)
    {
        $tableName = Str::snake($tableName);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['status' => 'error', 'message' => 'Tabel tidak ada'], 404);
        }

        try {
            DB::table($tableName)->truncate();
            return response()->json([
                'status' => 'success',
                'message' => "Seluruh data di tabel $tableName berhasil dihapus"
            ]);
        } catch (\Exception $e) {
            Log::error('Delete table error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal hapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update satu baris berdasarkan ID
     */
    public function updateRow(Request $request, $tableName, $id)
    {
        $tableName = Str::snake($tableName);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['status' => 'error', 'message' => 'Tabel tidak ada'], 404);
        }

        $data = $request->except(['id']);
        $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

        try {
            DB::table($tableName)->where('id', $id)->update($data);
            return response()->json(['status' => 'success', 'message' => 'Data berhasil diupdate']);
        } catch (\Exception $e) {
            Log::error('Update row error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal update data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus satu baris berdasarkan ID
     */
    public function deleteRow($tableName, $id)
    {
        $tableName = Str::snake($tableName);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['status' => 'error', 'message' => 'Tabel tidak ada'], 404);
        }

        try {
            DB::table($tableName)->where('id', $id)->delete();
            return response()->json(['status' => 'success', 'message' => 'Baris berhasil dihapus']);
        } catch (\Exception $e) {
            Log::error('Delete row error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal hapus baris',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ambil daftar semua tabel
     */
    public function listTables()
    {
        $tables = DB::select('SHOW TABLES');
        $dbName = 'Tables_in_' . env('DB_DATABASE');
        $result = [];

        foreach ($tables as $table) {
            $result[] = $table->$dbName;
        }

        return response()->json([
            'status' => 'success',
            'tables' => $result
        ]);
    }
}
