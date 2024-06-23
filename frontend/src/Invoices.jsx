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
} from '@mui/material';
import { ReactToPrint, PrintContextConsumer } from 'react-to-print';
import * as XLSX from 'xlsx';

const InvoiceTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const componentRef = useRef(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/invoice');
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };
    fetchInvoices();
  }, []);

  const handlePrint = () => {
    if (selectedInvoice) {
      // Create a new window for printing
      const printWindow = window.open('', 'Print Window', 'width=800,height=600');
  
      // Write the invoice content to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${selectedInvoice.id}</title>
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
            <h2>Invoice #${selectedInvoice.id}</h2>
            <table>
              <tr>
                <th>Customer Name</th>
                <td>${selectedInvoice.customer_name}</td>
              </tr>
              <tr>
                <th>Items</th>
                <td>${selectedInvoice.items}</td>
              </tr>
              <tr>
                <th>User ID</th>
                <td>${selectedInvoice.user_id}</td>
              </tr>
            </table>
          </body>
        </html>
      `);
  
      // Print the new window
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } else {
      console.log('Please select an invoice to print.');
    }
  };

  const handleExportToExcel = () => {
    if (selectedInvoice) {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([selectedInvoice]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice');
      XLSX.writeFile(workbook, `invoice_${selectedInvoice.id}.xlsx`);
    } else {
      console.log('Please select an invoice to export.');
    }
  };

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
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
      <TableContainer component={Paper} style={{ width: '800px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>User ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                onClick={() => handleRowClick(invoice)}
                style={{
                  backgroundColor: selectedInvoice?.id === invoice.id ? '#f5f5f5' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.customer_name}</TableCell>
                <TableCell>{invoice.items}</TableCell>
                <TableCell>{invoice.user_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedInvoice && (
        <PrintContextConsumer>
          {({ handlePrint }) => (
            <div ref={componentRef} style={{ width: '800px', marginTop: '24px' }}>
              <h2>Invoice #{selectedInvoice.id}</h2>
              <p>Customer Name: {selectedInvoice.customer_name}</p>
              <p>Items: {selectedInvoice.items}</p>
              <p>User ID: {selectedInvoice.user_id}</p>
              <Button variant="contained" color="primary" onClick={handlePrint}>
                Print
              </Button>
            </div>
          )}
        </PrintContextConsumer>
      )}
    </Box>
  );
};

export default InvoiceTable;