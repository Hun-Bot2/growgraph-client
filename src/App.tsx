import React, { useState, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MindMap from './components/MindMap';
import UserInputForm, { UserData } from './components/UserInputForm';
import EmailForm from './components/EmailForm';
import axios, { AxiosError } from 'axios';
import { Node, Edge } from 'reactflow';
import { CircularProgress, Typography, Button, Box } from '@mui/material';

// Types
interface MindMapNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
}

interface MindMapResponse {
  nodes: MindMapNode[];
  edges: Edge[];
}

interface ApiError {
  error: string;
  details?: string;
}

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// API URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

// API client
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function App() {
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [showUserInputForm, setShowUserInputForm] = useState(false);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = useCallback((submittedEmail: string) => {
    setShowEmailForm(false);
    setShowUserInputForm(true);
  }, []);

  const handleUserInputSubmit = useCallback(async (data: UserData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<MindMapResponse>('/api/generate-mindmap', data);
      setMindMapData(response.data);
      setShowUserInputForm(false);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.details || error.response?.data?.error || '마인드맵 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setShowUserInputForm(true);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showEmailForm && <EmailForm onSubmit={handleEmailSubmit} />}
      {showUserInputForm && <UserInputForm open={showUserInputForm} onSubmit={handleUserInputSubmit} />}
      {!showEmailForm && !showUserInputForm && mindMapData && (
        <MindMap initialData={mindMapData} />
      )}
      {mindMapData && (
        <pre style={{ background: '#eee', color: '#333', padding: 16, margin: 16, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
          {JSON.stringify(mindMapData, null, 2)}
        </pre>
      )}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
            마인드맵을 생성하고 있습니다...
          </Typography>
        </Box>
      )}
      {error && !loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000
          }}
        >
          <Typography color="error" variant="h6">{error}</Typography>
          <Button onClick={handleRetry} variant="contained" sx={{ mt: 2 }}>
            다시 시도
          </Button>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App; 