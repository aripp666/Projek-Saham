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

class DataSahamController extends Controller
{
    // ==========================
    // 🔹 Import dari Excel
    // ==========================
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
            'table_name' => 'required|string',
        ]);

        $file = $request->file('file');
        $tableName = Str::snake($request->table_name);

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true);

            if (count($rows) < 2) {
                return response()->json(['message' => 'File kosong!'], 400);
            }

            // Ambil header & filter
            $header = array_map(function ($col) {
                $col = trim((string)$col);
                return $col === '' ? null : strtolower(preg_replace('/[^A-Za-z0-9]/', '_', $col));
            }, array_values($rows[1]));

            $header = array_values(array_filter(array_unique($header), fn($h) => !empty($h)));

            // Buat table baru kalau belum ada
            if (!Schema::hasTable($tableName)) {
                Schema::create($tableName, function (Blueprint $table) use ($header) {
                    $table->id();
                    foreach ($header as $col) {
                        $table->text($col)->nullable();
                    }
                    $table->timestamps();
                });
            } else {
                // Tambahkan kolom baru jika perlu
                $existingColumns = Schema::getColumnListing($tableName);
                foreach ($header as $col) {
                    if (!in_array($col, $existingColumns)) {
                        Schema::table($tableName, function (Blueprint $table) use ($col) {
                            $table->text($col)->nullable();
                        });
                    }
                }
            }

            // Siapkan data untuk insert
            $dataRows = array_slice($rows, 1);
            $allData = [];
            foreach ($dataRows as $row) {
                $rowData = [];
                foreach ($header as $key => $col) {
                    $value = array_values($row)[$key] ?? null;
                    $rowData[$col] = $value;
                }
                if (!empty(array_filter($rowData))) {
                    $allData[] = $rowData;
                }
            }

            // Hapus data lama & isi ulang
            DB::table($tableName)->truncate();
            if (!empty($allData)) {
                DB::table($tableName)->insert($allData);
            }

            return response()->json([
                'message' => 'Data berhasil diimport',
                'rows' => count($allData),
                'table' => $tableName
            ]);
        } catch (\Exception $e) {
            \Log::error("Excel Import Error: " . $e->getMessage(), [
                'file' => $file->getClientOriginalName(),
                'table' => $tableName,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Gagal import Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==========================
    // 🔹 CRUD Dinamis
    // ==========================

    // GET ALL
    public function index(Request $request)
    {
        $tableName = Str::snake($request->table_name);

        if (!Schema::hasTable($tableName)) {
            return response()->json(['message' => 'Tabel tidak ditemukan'], 404);
        }

        $data = DB::table($tableName)->orderBy('id', 'asc')->get();
        return response()->json($data);
    }

    // CREATE
    public function store(Request $request)
    {
        $tableName = Str::snake($request->table_name);
        $data = $request->except(['table_name']);

        $id = DB::table($tableName)->insertGetId($data);
        return response()->json(['message' => 'Data berhasil ditambahkan', 'id' => $id]);
    }

    // UPDATE
    public function update(Request $request, $id)
    {
        $tableName = Str::snake($request->table_name);
        $data = $request->except(['table_name']);

        DB::table($tableName)->where('id', $id)->update($data);
        return response()->json(['message' => 'Data berhasil diupdate']);
    }

    // DELETE
    public function destroy(Request $request, $id)
    {
        $tableName = Str::snake($request->table_name);
        DB::table($tableName)->where('id', $id)->delete();
        return response()->json(['message' => 'Data berhasil dihapus']);
    }

    // ==========================
    // 🔹 Export ke Excel
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
            $sheet = $spreadsheet->getActiveSheet();

            $columns = array_keys((array) $data->first());
            $lastColumn = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($columns));

            // =========================
            // Header
            // =========================
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

            // =========================
            // Data
            // =========================
            foreach ($data as $rowIndex => $row) {
                $isEvenRow = $rowIndex % 2 === 0;
                foreach ($columns as $colIndex => $colName) {
                    $cell = $sheet->getCellByColumnAndRow($colIndex + 1, $rowIndex + 2);
                    $cell->setValue($row->$colName);

                    // Style border + zebra stripes
                    $sheet->getStyle($cell->getCoordinate())->applyFromArray([
                        'borders' => [
                            'allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
                        ],
                        'fill' => [
                            'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                            'startColor' => ['rgb' => $isEvenRow ? 'FFF2CC' : 'FFFFFF']
                        ]
                    ]);
                }
            }

            // =========================
            // Auto size columns
            // =========================
            foreach (range(1, count($columns)) as $colIndex) {
                $sheet->getColumnDimensionByColumn($colIndex)->setAutoSize(true);
            }

            // =========================
            // Table style (filter)
            // =========================
            $sheet->setAutoFilter("A1:{$lastColumn}" . (count($data) + 1));

            $fileName = 'data_saham.xlsx'; // Nama file sederhana
            $writer = new Xlsx($spreadsheet);

            if (ob_get_length()) ob_end_clean();

            return response()->streamDownload(function() use ($writer) {
                $writer->save('php://output');
            }, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Cache-Control' => 'max-age=0',
            ]);
        }


}
