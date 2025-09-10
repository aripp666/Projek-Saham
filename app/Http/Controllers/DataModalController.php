<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Log;

class DataModalController extends Controller
{
    // ==========================
    // 🔹 Tampilkan Data (Per Sheet)
    // ==========================
    public function index(Request $request)
    {
        $tableName = Str::snake($request->table_name);
        $sheet = $request->sheet ?? null;

        if (!$tableName || !Schema::hasTable($tableName)) {
            return response()->json(['message' => 'Tabel tidak ditemukan'], 404);
        }

        try {
            $query = DB::table($tableName);

            // Filter sheet jika ada
            if ($sheet) {
                if (Schema::hasColumn($tableName, 'source_sheet')) {
                    $query->where('source_sheet', $sheet);
                } else {
                    return response()->json([
                        'message' => 'Kolom source_sheet tidak ditemukan di tabel ' . $tableName
                    ], 400);
                }
            }

            $data = $query->orderBy('id', 'asc')->get();

            // Bersihkan data kosong
            $cleaned = $data->map(function ($row) {
                return collect($row)->filter(fn($v) => $v !== null && $v !== '')->all();
            })->values();

            // Ambil daftar sheet unik untuk frontend
            $sheets = Schema::hasColumn($tableName, 'source_sheet')
                ? $data->pluck('source_sheet')->unique()->filter()->values()
                : [];

            return response()->json([
                'data' => $cleaned,
                'total' => $cleaned->count(),
                'sheets' => $sheets
            ]);
        } catch (\Exception $e) {
            Log::error("DataModalController@index Error: " . $e->getMessage(), [
                'table' => $tableName,
                'sheet' => $sheet,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Gagal mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==========================
    // 🔹 Import Excel Multi-Sheet
    // ==========================
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
            'table_prefix' => 'required|string',
        ]);

        $file = $request->file('file');
        $tableName = Str::snake($request->table_prefix);

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheetNames = $spreadsheet->getSheetNames();

            if (!Schema::hasTable($tableName)) {
                Schema::create($tableName, function (Blueprint $table) {
                    $table->id();
                    $table->string('source_sheet')->nullable();
                    $table->timestamps();
                });
            }

            foreach ($sheetNames as $sheetName) {
                $sheet = $spreadsheet->getSheetByName($sheetName);
                $rows = array_values($sheet->toArray(null, true, true, true));

                if (count($rows) < 2) {
                    Log::warning("Sheet {$sheetName} kosong, dilewati.");
                    continue;
                }

                $maxCols = 7;
                $numCols = 0;

                foreach ($rows as $row) {
                    $filled = 0;
                    $vals = array_values($row);
                    for ($j = 0; $j < $maxCols; $j++) {
                        if (!empty($vals[$j])) $filled = $j + 1;
                    }
                    $numCols = max($numCols, $filled);
                }

                if ($numCols === 0) continue;

                // Siapkan header kolom
                $header = [];
                for ($i = 1; $i <= $numCols; $i++) $header[] = 'col_' . $i;

                $existingColumns = Schema::getColumnListing($tableName);
                foreach ($header as $col) {
                    if (!in_array($col, $existingColumns)) {
                        Schema::table($tableName, fn(Blueprint $table) => $table->text($col)->nullable());
                    }
                }

                // Hapus data lama untuk sheet ini
                DB::table($tableName)->where('source_sheet', $sheetName)->delete();

                $dataRows = array_slice($rows, 1);
                $allData = [];

                foreach ($dataRows as $row) {
                    $values = array_values($row);
                    $values = array_pad($values, $numCols, null);
                    $values = array_slice($values, 0, $numCols);

                    if (!array_filter($values)) continue;

                    $rowData = array_combine($header, $values);
                    $rowData['source_sheet'] = $sheetName;

                    $allData[] = $rowData;
                }

                if (!empty($allData)) {
                    DB::transaction(function() use ($allData, $tableName) {
                        foreach (array_chunk($allData, 500) as $chunk) {
                            DB::table($tableName)->insert($chunk);
                        }
                    });
                }

                Log::info("Sheet {$sheetName} berhasil diimport ke tabel {$tableName}");
            }

            return response()->json([
                'message' => 'Import selesai, data lama per sheet diganti dengan data baru tanpa duplikat',
            ]);
        } catch (\Exception $e) {
            Log::error("Excel Import Error: " . $e->getMessage(), [
                'file' => $file?->getClientOriginalName(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Gagal import Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==========================
    // 🔹 Tambah Row Manual
    // ==========================
    public function store(Request $request)
    {
        $request->validate([
            'table_name' => 'required|string',
        ]);

        $tableName = Str::snake($request->table_name);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['message' => 'Tabel tidak ditemukan'], 404);
        }

        $columns = Schema::getColumnListing($tableName);
        $data = [];

        foreach ($columns as $col) {
            if (str_starts_with($col, 'col_') && $request->has($col)) {
                $data[$col] = $request->input($col);
            }
        }

        $data['source_sheet'] = $request->input('source_sheet', 'manual');

        $id = DB::table($tableName)->insertGetId($data);

        return response()->json([
            'message' => 'Row baru berhasil ditambahkan',
            'id' => $id
        ], 201);
    }

    // ==========================
    // 🔹 Update Data
    // ==========================
    public function update(Request $request, $id)
    {
        $tableName = Str::snake($request->table_name);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['message' => 'Tabel tidak ditemukan'], 404);
        }

        $data = $request->except(['table_name']);
        DB::table($tableName)->where('id', $id)->update($data);

        return response()->json(['message' => '✅ Data berhasil diupdate']);
    }

    // ==========================
    // 🔹 Hapus Data
    // ==========================
    public function destroy(Request $request, $id)
    {
        $tableName = Str::snake($request->table_name);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['message' => 'Tabel tidak ditemukan'], 404);
        }

        DB::table($tableName)->where('id', $id)->delete();

        return response()->json(['message' => '✅ Data berhasil dihapus']);
    }

    // ==========================
    // 🔹 Export Tabel ke Excel
    // ==========================
// ==========================
// 🔹 Export Tabel ke Excel per Sheet (nama sheet = source_sheet)
// ==========================
    public function export(Request $request)
    {
        $tableName = Str::snake($request->table_name);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['message' => 'Tabel tidak ditemukan'], 404);
        }

        $data = DB::table($tableName)->get();
        if ($data->isEmpty()) {
            return response()->json(['message' => 'Tidak ada data untuk diexport'], 400);
        }

        $spreadsheet = new Spreadsheet();

        // Ambil sheet unik (nama kabupaten/kota)
        $sheets = $data->pluck('source_sheet')->unique()->filter()->values();

        foreach ($sheets as $sheetIndex => $sheetName) {
            $sheetData = $data->where('source_sheet', $sheetName)->values();

            // Buat sheet baru atau gunakan sheet pertama
            if ($sheetIndex === 0) {
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setTitle(substr($sheetName, 0, 31)); // maksimal 31 karakter
            } else {
                $sheet = $spreadsheet->createSheet();
                $sheet->setTitle(substr($sheetName, 0, 31));
            }

            // Header
            $columns = array_keys((array) $sheetData->first());
            foreach ($columns as $colIndex => $colName) {
                $cell = $sheet->getCellByColumnAndRow($colIndex + 1, 1);
                $cell->setValue(strtoupper($colName));

                // Style header
                $sheet->getStyle($cell->getCoordinate())->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '5A0000']
                    ],
                    'borders' => [
                        'allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
                    ],
                    'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
                ]);
            }

            // Data
            foreach ($sheetData as $rowIndex => $row) {
                foreach ($columns as $colIndex => $colName) {
                    $cell = $sheet->getCellByColumnAndRow($colIndex + 1, $rowIndex + 2);
                    $cell->setValue($row->$colName);

                    // Border
                    $sheet->getStyle($cell->getCoordinate())->applyFromArray([
                        'borders' => [
                            'allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
                        ]
                    ]);
                }
            }

            // Auto size kolom
            foreach (range(1, count($columns)) as $colIndex) {
                $sheet->getColumnDimensionByColumn($colIndex)->setAutoSize(true);
            }

            // Auto filter
            $lastColumn = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($columns));
            $sheet->setAutoFilter("A1:{$lastColumn}" . (count($sheetData) + 1));
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = $tableName . '.xlsx';

        if (ob_get_length()) ob_end_clean();
        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    // ==========================
    // 🔹 List Semua Tabel
    // ==========================
    public function tables()
    {
        $tables = DB::select("SHOW TABLES");
        $key = 'Tables_in_' . env('DB_DATABASE');
        $list = array_map(fn($t) => $t->$key, $tables);
        return response()->json($list);
    }
    
}
