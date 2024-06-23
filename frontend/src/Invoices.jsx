import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Checkbox,
} from '@mui/material';
import { ReactToPrint, PrintContextConsumer } from 'react-to-print';
import * as XLSX from 'xlsx';

const InvoiceTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const componentRef = useRef(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // Get the token from the local storage
        const token = localStorage.getItem('token');
  
        const response = await fetch('http://localhost:8000/api/invoice', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
        // Ensure the 'total' property is always defined
        setInvoices(
          data.map((invoice) => ({
            ...invoice,
            total: invoice.total || 0,
            isSelected: false,
          }))
        );
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };
    fetchInvoices();
  }, []);

  const handlePrint = () => {
    if (selectedInvoices.length > 0) {
      // Create a new window for printing
      const printWindow = window.open('', 'Print Window', 'width=800,height=600');

      // Write the invoice content to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoices</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <h2>Invoices</h2>
            <table>
              <tr>
                <th>ID</th>
                <th>Customer Name</th>
                <th>Items</th>
                <th>User</th>
                <th>Total</th>
              </tr>
              ${selectedInvoices
                .map(
                  (invoice) => `
                <tr>
                  <td>${invoice.id}</td>
                  <td>${invoice.customer_name}</td>
                  <td>${invoice.items}</td>
                  <td>${invoice.name}</td>
                  <td>${invoice.total}</td>
                </tr>
              `
                )
                .join('')}
            </table>
          </body>
        </html>
      `);

      // Print the new window
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } else {
      console.log('Please select at least one invoice to print.');
    }
  };

  const handleExportToExcel = () => {
    if (selectedInvoices.length > 0) {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(selectedInvoices);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
      XLSX.writeFile(workbook, 'invoices.xlsx');
    } else {
      console.log('Please select at least one invoice to export.');
    }
  };

  const handleCheckboxChange = (invoiceId) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, isSelected: !invoice.isSelected }
          : invoice
      )
    );

    setSelectedInvoices((prevSelectedInvoices) => {
      const selectedInvoice = invoices.find((invoice) => invoice.id === invoiceId);
      if (selectedInvoice.isSelected) {
        return [...prevSelectedInvoices, selectedInvoice];
      } else {
        return prevSelectedInvoices.filter((invoice) => invoice.id !== invoiceId);
      }
    });
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Box mb={2} display="flex" justifyContent="flex-end" width="100%">
        <Button variant="contained" color="primary" onClick={handlePrint} sx={{ mr: 2 }}>
          Print
        </Button>
        <Button variant="contained" color="secondary" onClick={handleExportToExcel}>
          Export to Excel
        </Button>
      </Box>
      <TableContainer component={Paper} style={{ width: '70vw' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>User </TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Checkbox
                    checked={invoice.isSelected}
                    onChange={() => handleCheckboxChange(invoice.id)}
                  />
                </TableCell>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.customer_name}</TableCell>
                <TableCell>{invoice.items}</TableCell>
                <TableCell>{invoice.name}</TableCell>
                <TableCell>{invoice.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedInvoices.length > 0 && (
        <PrintContextConsumer>        
            <div ref={componentRef} style={{ width: '70vw', marginTop: '24px' }}>
              <h2>Selected Invoices</h2>
              {selectedInvoices.map((invoice) => (
                <div key={invoice.id}>
                  <h3>Invoice #{invoice.id}</h3>
                  <p>Customer Name: {invoice.customer_name}</p>
                  <p>Items: {invoice.items}</p>
                  <p>User: {invoice.name}</p>
                  <p>Total: {invoice.total}</p>
                </div>
              ))}
            </div>        
        </PrintContextConsumer>
      )}
    </Box>
  );
};

export default InvoiceTable;