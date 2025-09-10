<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perda extends Model
{
    protected $fillable = ['judul', 'data'];
    protected $casts = [
        'data' => 'array', // otomatis decode/encode JSON
    ];
}
