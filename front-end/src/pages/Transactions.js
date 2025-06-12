import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  addTransactionStart,
  addTransactionSuccess,
  addTransactionFailure,
} from '../store/slices/transactionSlice';
import { getTransactions, createTransaction } from '../services/transactionService';
import { getProducts } from '../services/productService';

const transactionTypes = [
  { value: 'URETIM_BASLADI', label: 'Üretim Başladı' },
  { value: 'URETIM_TAMAMLANDI', label: 'Üretim Tamamlandı' },
  { value: 'KALITE_KONTROL', label: 'Kalite Kontrol' },
  { value: 'DEPOYA_ALINDI', label: 'Depoya Alındı' },
  { value: 'DAGITIMA_HAZIR', label: 'Dağıtıma Hazır' },
  { value: 'DAGITIMDA', label: 'Dağıtımda' },
  { value: 'PERAKENDE_SATIS', label: 'Perakende Satış' },
  { value: 'SATIS_TAMAMLANDI', label: 'Satış Tamamlandı' },
];

const Transactions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transactions, loading, error } = useSelector((state) => state.transactions);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    productId: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchTransactionsStart());
        const [transactionsData, productsData] = await Promise.all([
          getTransactions(),
          getProducts(),
        ]);
        dispatch(fetchTransactionsSuccess(transactionsData));
        setProducts(productsData);
      } catch (err) {
        dispatch(fetchTransactionsFailure(err.message));
      }
    };

    fetchData();
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      type: '',
      productId: '',
      description: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(addTransactionStart());
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const newTransaction = await createTransaction({
        type: formData.type,
        description: formData.description,
        product: { id: formData.productId },
        user: { id: currentUser?.id },
      });
      dispatch(addTransactionSuccess(newTransaction));
      handleClose();
    } catch (err) {
      dispatch(addTransactionFailure(err.message));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">İşlemler</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Yeni İşlem
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>İşlem Tipi</TableCell>
              <TableCell>Ürün</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transactionTypes.find((t) => t.value === transaction.type)?.label || transaction.type}
                </TableCell>
                <TableCell>
                  {products.find((p) => p.id === transaction.productId)?.name || 'Bilinmiyor'}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/transactions/${transaction.id}`)}
                  >
                    Detay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Yeni İşlem</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="İşlem Tipi"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            >
              {transactionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Ürün"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions; 