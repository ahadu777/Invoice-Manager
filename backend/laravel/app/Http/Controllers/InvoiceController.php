<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItems;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $invoices = Invoice::leftjoin('users', 'invoices.user_id', 'users.id')
            ->where('invoices.user_id', $user->id)
            ->select('users.name', 'invoices.*')
            ->latest()
            ->get();

        $invoiceItems = InvoiceItems::whereIn('invoice_id', $invoices->pluck('id'))
            ->get()
            ->groupBy('invoice_id')
            ->map(function ($items, $invoiceId) {
                return [
                    'items' => $items->map(function ($item) {
                        return [
                            'item' => $item->item,
                            'amount' => $item->amount,
                        ];
                    })->toArray(),
                ];
            });

        $invoices->each(function ($invoice) use ($invoiceItems) {
            $invoice->items = $invoiceItems[$invoice->id]['items'] ?? [];
        });

        return response()->json($invoices);
    }

    /**
     * Store a newly created invoice in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required',
            'items' => 'required|array',
            'items.*.item' => 'required',
            'items.*.amount' => 'required|integer|min:1',
        ]);

        $invoice = Invoice::create([
            'customer_name' => $request->customer_name,
            'total_amount' => 0,
            'user_id' => Auth::id(),
        ]);
        $totalAmount = 0;
        foreach ($request->items as $invoiceItem) {
            $inv_item = new InvoiceItems();
            $inv_item->invoice_id = $invoice->id;
            $inv_item->item = $invoiceItem['item'];
            $inv_item->amount = $invoiceItem['amount'];
            $totalAmount += $invoiceItem['amount'];
            $inv_item->save();
        }

        $invoice->update(['total_amount' => $totalAmount]);

        return response()->json($invoice, 201);
    }
    /**
     * Display the specified invoice.
     *
     * @param  \App\Models\Invoice  $invoice
     * @return JsonResponse
     */
    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($invoice);
    }

    /**
     * Update the specified invoice in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Invoice  $invoice
     * @return JsonResponse
     */
    public function update(Request $request, Invoice $invoice): JsonResponse
{
    $request->validate([
        'customer_name' => 'required',
        'total_amount'=>'required',
        'items' => 'required',
    ]);

    $invoice->update([
        'customer_name' => $request->customer_name,
        'total_amount' => $request->total_amount,
    ]);

    $items = collect($request->items)->map(function ($item) use ($invoice) {
        return [
            'item' => $item['item'],
            'amount' => $item['amount'],
            'invoice_id' => $invoice->id,
        ];
    });

    InvoiceItems::where('invoice_id', $invoice->id)->delete();
    InvoiceItems::insert($items->toArray());

    return response()->json(["updated successfully"],200);
}

    /**
     * Remove the specified invoice from storage.
     *
     * @param  \App\Models\Invoice  $invoice
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $user = auth()->user();
        $invoice = Invoice::where('user_id', $user->id)
            ->findOrFail($id);
        $invoice_items=InvoiceItems::where('invoice_id', $invoice->id);
        $invoice_items->delete();
        $invoice->delete();    
        return response()->json([
            'message' => 'Invoice deleted successfully',
        ],200);
    }
}
