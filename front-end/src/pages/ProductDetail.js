import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getProductById, updateProduct } from '../services/productService';
import { getTransactionsByProduct } from '../services/transactionService';
import {
  setCurrentProduct,
  updateProductStart,
  updateProductSuccess,
  updateProductFailure,
} from '../store/slices/productSlice';
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
} from '../store/slices/transactionSlice';

const statusOptions = [
  { value: 'IN_PRODUCTION', label: 'Üretimde' },
  { value: 'QUALITY_CHECK', label: 'Kalite Kontrol' },
  { value: 'IN_DISTRIBUTION', label: 'Dağıtımda' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, loading: productLoading, error: productError } = useSelector(
    (state) => state.products
  );
  const { transactions, loading: transactionsLoading, error: transactionsError } = useSelector(
    (state) => state.transactions
  );
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    material: '',
    size: '',
    color: '',
    status: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await getProductById(id);
        dispatch(setCurrentProduct(productData));
        setFormData({
          name: productData.name,
          description: productData.description,
          material: productData.material,
          size: productData.size,
          color: productData.color,
          status: productData.status,
        });

        dispatch(fetchTransactionsStart());
        const transactionsData = await getTransactionsByProduct(id);
        dispatch(fetchTransactionsSuccess(transactionsData));
      } catch (error) {
        dispatch(updateProductFailure(error.message));
        dispatch(fetchTransactionsFailure(error.message));
      }
    };

    fetchData();
  }, [dispatch, id]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateProductStart());
      const updatedProduct = await updateProduct(id, formData);
      dispatch(updateProductSuccess(updatedProduct));
      handleClose();
    } catch (error) {
      dispatch(updateProductFailure(error.message));
    }
  };

  if (productLoading || transactionsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (productError || transactionsError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {productError || transactionsError}
      </Alert>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Geri Dön
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">{currentProduct?.name}</Typography>
          <Button variant="contained" onClick={handleOpen}>
            Düzenle
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Açıklama
            </Typography>
            <Typography variant="body1" paragraph>
              {currentProduct?.description}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary">
              Materyal
            </Typography>
            <Typography variant="body1" paragraph>
              {currentProduct?.material}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary">
              Beden
            </Typography>
            <Typography variant="body1" paragraph>
              {currentProduct?.size}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Renk
            </Typography>
            <Typography variant="body1" paragraph>
              {currentProduct?.color}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary">
              Parti No
            </Typography>
            <Typography variant="body1" paragraph>
              {currentProduct?.batchNumber}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary">
              Durum
            </Typography>
            <Typography variant="body1" paragraph>
              {statusOptions.find((option) => option.value === currentProduct?.status)?.label}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        İşlem Geçmişi
      </Typography>

      <Paper sx={{ p: 3 }}>
        {transactions.map((transaction) => (
          <Box key={transaction.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle1">
              {new Date(transaction.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {transaction.type}
            </Typography>
            <Typography variant="body2">
              İşlemi Yapan: {transaction.user.fullName}
            </Typography>
          </Box>
        ))}
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ürün Düzenle</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Ürün Adı"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="description"
              label="Açıklama"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="material"
              label="Materyal"
              value={formData.material}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="size"
              label="Beden"
              value={formData.size}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="color"
              label="Renk"
              value={formData.color}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="status"
              label="Durum"
              value={formData.status}
              onChange={handleChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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

export default ProductDetail; 