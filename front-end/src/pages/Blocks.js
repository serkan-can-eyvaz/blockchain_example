import React, { useEffect, useState } from 'react';
import { getBlocks, validateChain } from '../services/blockService';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blocksData, validityData] = await Promise.all([
          getBlocks(),
          validateChain(),
        ]);
        setBlocks(blocksData);
        setIsValid(validityData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTestValidation = async () => {
    try {
      const result = await validateChain();
      setIsValid(result);
    } catch (err) {
      setError(err.message);
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
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" flexGrow={1}>Blok Zinciri</Typography>
        <Button variant="contained" onClick={handleTestValidation} sx={{ ml: 2 }}>
          Zincir Bütünlüğünü Test Et
        </Button>
        <Alert severity={isValid === null ? '...' : isValid ? 'success' : 'error'} sx={{ ml: 2 }}>
          Zincir Durumu: {isValid === null ? '...' : isValid ? 'Güvenli' : 'Bozuk'}
        </Alert>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Zaman</TableCell>
              <TableCell>Hash</TableCell>
              <TableCell>Önceki Hash</TableCell>
              <TableCell>Detay</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell>{block.index}</TableCell>
                <TableCell>{new Date(block.timestamp).toLocaleString()}</TableCell>
                <TableCell style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.hash}</TableCell>
                <TableCell style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.previousHash}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => setSelectedBlock(block)}>
                    Detay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedBlock} onClose={() => setSelectedBlock(null)} maxWidth="md" fullWidth>
        <DialogTitle>Blok Detayı</DialogTitle>
        <DialogContent>
          {selectedBlock && (
            <Box>
              <Typography variant="subtitle2">Blok Index: {selectedBlock.index}</Typography>
              <Typography variant="subtitle2">Zaman: {new Date(selectedBlock.timestamp).toLocaleString()}</Typography>
              <Typography variant="subtitle2">Hash: {selectedBlock.hash}</Typography>
              <Typography variant="subtitle2">Önceki Hash: {selectedBlock.previousHash}</Typography>
              <Typography variant="subtitle2">Nonce: {selectedBlock.nonce}</Typography>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>İşlemler:</Typography>
              <Paper sx={{ p: 2, mt: 1, background: '#f5f5f5' }}>
                <pre style={{ margin: 0, fontSize: 14 }}>
                  {JSON.stringify(JSON.parse(selectedBlock.transactionsJson), null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBlock(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Blocks; 