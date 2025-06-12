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
  Select,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  createProductStart,
  createProductSuccess,
  createProductFailure,
} from '../store/slices/productSlice';
import { createProduct, getProducts, deleteProduct as deleteProductApi } from '../services/productService';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    material: '',
    size: '',
    color: '',
    batchNumber: '',
    status: 'HAMMADDE',
  });

  const fetchProducts = async () => {
    try {
      dispatch(fetchProductsStart());
      const data = await getProducts();
      dispatch(fetchProductsSuccess(data));
    } catch (error) {
      dispatch(fetchProductsFailure(error.message));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [dispatch]);

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
      dispatch(createProductStart());
      const response = await createProduct(formData);
      dispatch(createProductSuccess(response));
      setFormData({
        name: '',
        description: '',
        material: '',
        size: '',
        color: '',
        batchNumber: '',
        status: 'HAMMADDE',
      });
      handleClose();
      fetchProducts();
    } catch (error) {
      dispatch(createProductFailure(error.message));
      if (error.response?.status === 403) {
        alert('Bu işlem için yetkiniz bulunmamaktadır. Sadece üretici hesapları ürün ekleyebilir.');
      } else {
        alert('Ürün eklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await deleteProductApi(id);
        fetchProducts();
      } catch (error) {
        alert('Ürün silinirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Ürün Adı', width: 200 },
    { field: 'description', headerName: 'Açıklama', width: 300 },
    { field: 'material', headerName: 'Materyal', width: 150 },
    { field: 'size', headerName: 'Beden', width: 100 },
    { field: 'color', headerName: 'Renk', width: 100 },
    { field: 'batchNumber', headerName: 'Parti Numarası', width: 150 },
    {
      field: 'status',
      headerName: 'Durum',
      width: 150,
      valueGetter: (params) => {
        const statusMap = {
          IN_PRODUCTION: 'Üretimde',
          QUALITY_CHECK: 'Kalite Kontrol',
          IN_DISTRIBUTION: 'Dağıtımda',
          DELIVERED: 'Teslim Edildi',
        };
        return statusMap[params.row.status] || params.row.status;
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/products/${params.row.id}`)}
            sx={{ mr: 1 }}
          >
            Detay
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Sil
          </Button>
        </>
      ),
    },
  ];

  const mappedProducts = (products || []).map((p) => ({
    ...p,
    id: p.id ?? p.productId ?? Math.random(),
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Ürünler</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Yeni Ürün
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={mappedProducts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          onRowClick={(params) => navigate(`/products/${params.row.id}`)}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Yeni Ürün Ekle</DialogTitle>
        <DialogContent>
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
            name="batchNumber"
            label="Parti Numarası"
            value={formData.batchNumber}
            onChange={handleChange}
          />
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mt: 2 }}
          >
            <MenuItem value="HAMMADDE">Hammadde</MenuItem>
            <MenuItem value="URETIM_ASAMASINDA">Üretim Aşamasında</MenuItem>
            <MenuItem value="URETIM_TAMAMLANDI">Üretim Tamamlandı</MenuItem>
            <MenuItem value="KALITE_KONTROL">Kalite Kontrol</MenuItem>
            <MenuItem value="DEPOYA_ALINDI">Depoya Alındı</MenuItem>
            <MenuItem value="DAGITIMA_HAZIR">Dağıtıma Hazır</MenuItem>
            <MenuItem value="DAGITIMDA">Dağıtımda</MenuItem>
            <MenuItem value="PERAKENDE_SATIS">Perakende Satış</MenuItem>
            <MenuItem value="SATIS_TAMAMLANDI">Satış Tamamlandı</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" type="button">
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products; 