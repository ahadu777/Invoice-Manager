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
import Create from './Create';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

const InvoiceTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(null);

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
            total: invoice.total_amount || 0,
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
                  <td>
                  ${invoice.items
                    .map(
                      (item) => `
                    <p>Item: ${item.item}, Price: ${item.amount}</p>
                  `
                    )
                    .join('')}
                  </td>
                  <td>${invoice.name}</td>
                  <td>${invoice.total_amount}</td>
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
  
      const worksheetData = selectedInvoices.flatMap((invoice) => [
        { Customer: invoice.customer_name, User: invoice.name, Invoice: invoice.id },
        ...invoice.items.map((item) => ({
          Item: item.item,
          Amount: item.amount,
        })),
        { '' : '' }, // Add an empty row between invoices
      ]);
  
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
      XLSX.writeFile(workbook, 'invoices.xlsx');
    } else {
      console.log('Please select at least one invoice to export.');
    }
  };

  const handleCheckboxChange = (invoiceId) => {
    setInvoices((prevInvoices) => {
      const updatedInvoices = prevInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, isSelected: !invoice.isSelected }
          : invoice
      );
  
      setSelectedInvoices((prevSelectedInvoices) => {
        const updatedInvoice = updatedInvoices.find((invoice) => invoice.id === invoiceId);
        if (updatedInvoice.isSelected) {
          return [...prevSelectedInvoices, updatedInvoice];
        } else {
          return prevSelectedInvoices.filter((invoice) => invoice.id !== invoiceId);
        }
      });
  
      return updatedInvoices;
    });
  };

  const handleMenuClick = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleEdit = (invoiceId) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    setEditedInvoice(invoice);
    setModalOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/invoice/${editedInvoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedInvoice),
      });

      if (response.ok) {
        // await fetchInvoices();
        setModalOpen(false);
        setEditedInvoice(null);
      } else {
        throw new Error('Error updating invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
  
      // Show an alert before deleting
      if (window.confirm('Are you sure you want to delete this invoice?')) {
        const response = await fetch(`http://localhost:8000/api/invoice/${selectedInvoice.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          // Fetch invoices again to refresh the page
          await fetchInvoices();
        } else {
          throw new Error('Error deleting invoice');
        }
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      handleMenuClose();
    }
  };
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Box mb={2} display="flex" justifyContent="flex-end" width="100%">
        <Create></Create>
        <Button variant="contained" color="primary" onClick={handlePrint} sx={{ml: 2, mr: 2 }}>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice,index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    checked={invoice.isSelected}
                    onChange={() => handleCheckboxChange(invoice.id)}
                  />
                </TableCell>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.customer_name}</TableCell>
                <TableCell>{invoice.items.map((item)=>(
                    <p>{                   'item '+ item.item + ' ,' + ' price ' + item.amount + '  '}
                   </p>
                ))}</TableCell>
                <TableCell>{invoice.name}</TableCell>
                <TableCell>{invoice.total_amount}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleMenuClick(event, invoice)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="long-menu"
                    anchorEl={anchorEl}
                    open={selectedInvoice === invoice}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleEdit(invoice.id)}>Edit</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {modalOpen && (
  <Modal
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
  >
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <Paper
        style={{
          padding: '2rem',
          width: '50vw',
          maxWidth: '600px',
        }}
      >
        <h2 id="modal-title">Edit Invoice</h2>
        <div id="modal-description">
          {/* Add your invoice edit form here */}
          <TextField
            label="Customer Name"
            value={editedInvoice?.customer_name}
            onChange={(e) =>
              setEditedInvoice({ ...editedInvoice, customer_name: e.target.value })
            }
          />
          <TextField
            label="Total Amount"
            value={editedInvoice?.total_amount}
            onChange={(e) =>
              setEditedInvoice({ ...editedInvoice, total_amount: e.target.value })
            }
          />
          <div>
            <h3>Invoice Items:</h3>
            {editedInvoice?.items.map((item, index) => (
              <div key={index}>
                <TextField sx={{mt: 3}}
                  label={`Item ${index + 1} Name`}
                  value={item.item}
                  onChange={(e) =>
                    setEditedInvoice({
                      ...editedInvoice,
                      items: editedInvoice.items.map((i, i_index) =>
                        i_index === index ? { ...i, item: e.target.value } : i
                      ),
                    })
                  }
                />
                <TextField sx={{mt: 3}}
                  label={`Item ${index + 1} Price`}
                  value={item.amount}
                  onChange={(e) =>
                    setEditedInvoice({
                      ...editedInvoice,
                      items: editedInvoice.items.map((i, i_index) =>
                        i_index === index ? { ...i, amount: e.target.value } : i
                      ),
                    })
                  }
                />
              </div>
            ))}
          </div>
          <Button variant="outlined" color="primary" sx={{ mt: 3 }} onClick={()=>setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" sx={{ mt: 3,ml:3 }} onClick={handleSaveEdit}>
            Save
          </Button>
        </div>
      </Paper>
    </Box>
  </Modal>
)}
    </Box>
  )};
export default InvoiceTable;