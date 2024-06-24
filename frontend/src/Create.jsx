import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { useState,useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Invoices from './Invoices'; // Assuming you have an Invoices component

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  p: 4,
};

export default function Create() {
  const [open, setOpen] = React.useState(false);
  const [customerName, setCustomerName] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState(0);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);
  const [invoiceCreated, setInvoiceCreated] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setCustomerName('');
    setItem('');
    setAmount(0);
    setItems([]);
    setTotalAmount(0);
    setInvoiceCreated(false);
  };

  const handleCustomerNameChange = (event) => {
    setCustomerName(event.target.value);
  };

  const handleItemChange = (event) => {
    setItem(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(parseFloat(event.target.value));
  };

  const handleAddItem = () => {
    if (!item.trim()) {
      setError('Item name is required.');
      return;
    }

    if (amount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setItems([...items, { item, amount }]);
    setItem('');
    setAmount(0);
    calculateTotalAmount();
    setError(null);
  };

  const calculateTotalAmount = () => {
    const total = items.reduce((acc, item) => acc + item.amount, 0);
    setTotalAmount(total);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (items.length === 0) {
      setError('At least one item is required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/api/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: customerName,
          items: items,
          total_amount: totalAmount,
        }),
      });

      if (response.ok) {
        console.log('Invoice created successfully');
        setInvoiceCreated(true);
        handleClose();
      } else {
        const error = await response.json();
        setError(error.message || 'Error creating invoice');
      }
    } catch (error) {
      setError('Error creating invoice: ' + error.message);
    }
  };
  return (
    <div>
      <Button onClick={handleOpen} variant="outlined">
        Add Invoice
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create Invoice
          </Typography>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            label="Customer Name"
            value={customerName}
            onChange={handleCustomerNameChange}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
            <TextField
              label="Item"
              value={item}
              onChange={handleItemChange}
              required
            />
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              required
            />
            <Button onClick={handleAddItem}>Add</Button>
          </Box>
          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
              <Typography>{item.item}</Typography>
              <Typography>{item.amount}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
      {invoiceCreated && <Invoices />}
    </div>
  );
}