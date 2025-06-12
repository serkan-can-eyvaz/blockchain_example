import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getTransactionById } from '../services/transactionService';
import { getProductById } from '../services/productService';
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
} from '../store/slices/transactionSlice';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [transaction, setTransaction] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchTransactionsStart());
        const transactionData = await getTransactionById(id);
        setTransaction(transactionData);

        if (transactionData.productId) {
          const productData = await getProductById(transactionData.productId);
          setProduct(productData);
        }

        dispatch(fetchTransactionsSuccess([transactionData]));
        setLoading(false);
      } catch (err) {
        dispatch(fetchTransactionsFailure(err.message));
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, dispatch]);

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          İşlem bulunamadı
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">İşlem Detayı</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
        >
          Geri Dön
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              İşlem Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">İşlem Tipi</Typography>
                <Typography>{transaction.type}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Tarih</Typography>
                <Typography>
                  {new Date(transaction.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Açıklama</Typography>
                <Typography>{transaction.description}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {product && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ürün Bilgileri
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Ürün Adı</Typography>
                  <Typography>{product.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Parti Numarası</Typography>
                  <Typography>{product.batchNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Materyal</Typography>
                  <Typography>{product.material}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Renk</Typography>
                  <Typography>{product.color}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Beden</Typography>
                  <Typography>{product.size}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Durum</Typography>
                  <Typography>{product.status}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TransactionDetail; 