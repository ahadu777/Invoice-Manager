<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class InvoiceController extends Controller
{
    public function index(): JsonResponse
    {
        $invoices = Invoice::all();
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
            'items' => 'required',
            'user_id' => 'required|integer',
        ]);

        $invoice = Invoice::create([
            'customer_name' => $request->customer_name,
            'items' => $request->items,
            'user_id' => $request->user_id,
        ]);

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
            'items' => 'required',
            'user_id' => 'required|integer',
        ]);

        $invoice->update([
            'customer_name' => $request->customer_name,
            'items' => $request->items,
            'user_id' => $request->user_id,
        ]);

        return response()->json($invoice);
    }

    /**
     * Remove the specified invoice from storage.
     *
     * @param  \App\Models\Invoice  $invoice
     * @return JsonResponse
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();
        return response()->json(null, 204);
    }
}
