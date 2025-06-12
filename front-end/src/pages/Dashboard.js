import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getProducts } from '../services/productService';
import { getTransactions } from '../services/transactionService';
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
} from '../store/slices/transactionSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { transactions, loading: transactionsLoading } = useSelector((state) => state.transactions);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, productsResponse] = await Promise.all([
          getTransactions(),
          getProducts()
        ]);
        setProducts(productsResponse);
        dispatch(fetchTransactionsSuccess(transactionsResponse));
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        if (error.response?.status === 403) {
          alert('Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır. Lütfen sistem yöneticisi ile iletişime geçin.');
        } else {
          alert('Veriler yüklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
        dispatch(fetchTransactionsFailure(error.message));
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

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
      <Typography variant="h4" gutterBottom>
        Hoş Geldiniz, {user?.fullName}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ürün İstatistikleri
            </Typography>
            <Typography variant="body1">
              Toplam Ürün Sayısı: {products.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              İşlem İstatistikleri
            </Typography>
            <Typography variant="body1">
              Toplam İşlem Sayısı: {transactions.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 