<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItems extends Model
{
    use HasFactory;
    protected $table='invoice_items';
    protected $fillable = [
        'invoice_id',
        'item',
        'amount'
    ];
}
