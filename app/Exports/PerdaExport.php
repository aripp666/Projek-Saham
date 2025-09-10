<?php

namespace App\Exports;

use App\Models\Perda;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class PerdaExport implements FromArray, WithHeadings, WithMapping, WithColumnFormatting, WithEvents
{
    protected $perdaData;

    public function __construct()
    {
        $perda = Perda::latest()->first();
        $this->perdaData = $perda ? $perda->data : [];
    }

    public function array(): array
    {
        return $this->perdaData;
    }

    // Heading Excel
    public function headings(): array
    {
        return [
            'NO',
            'PROVINSI/KAB/KOTA',
            'NO PERDA',
            'TAHUN',
            'MEKANISME SETORAN MODAL',
            'ASET',
            'NILAI ASET',
            'TUNAI',
            'KETERANGAN',
        ];
    }

    // Mapping setiap row + menambahkan NO otomatis
    public function map($row): array
    {
        $rowWithoutNo = count($row) > 1 ? array_slice($row, 1) : $row;

        return [
            $this->getRowIndex($row), // NO otomatis
            ...$rowWithoutNo
        ];
    }

    // Index untuk NO
    protected function getRowIndex($row)
    {
        $index = array_search($row, $this->perdaData);
        return $index !== false ? $index + 1 : '';
    }

    // Format kolom (G = NILAI ASET, H = TUNAI)
    public function columnFormats(): array
    {
        return [
            'G' => '"Rp "#,##0',
            'H' => '"Rp "#,##0',
        ];
    }

    // Styling Excel
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();

                // Header bold & background
                $sheet->getStyle('A1:I1')->getFont()->setBold(true);
                $sheet->getStyle('A1:I1')->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFFFA500'); // orange

                // Auto width semua kolom
                foreach (range('A', 'I') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }

                // Wrap text untuk kolom panjang
                $sheet->getStyle('B1:C' . $highestRow)
                      ->getAlignment()->setWrapText(true);

                // Alignment
                $sheet->getStyle('A1:A' . $highestRow)
                      ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('D1:D' . $highestRow)
                      ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('G1:H' . $highestRow)
                      ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // Border semua cell
                $sheet->getStyle('A1:I' . $highestRow)
                      ->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            },
        ];
    }
}
