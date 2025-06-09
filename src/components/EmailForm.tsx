import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';

interface EmailFormProps {
  onSubmit: (email: string) => void;
}

const EmailForm: React.FC<EmailFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('이메일을 입력해주세요');
      return;
    }
    if (!validateEmail(email)) {
      setError('유효한 이메일 주소를 입력해주세요');
      return;
    }
    onSubmit(email);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: { xs: 3, sm: 4 },
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            marginBottom: 3,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.8rem', sm: '2.5rem' }
          }}
        >
          GrowGraph
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            textAlign: 'center',
            marginBottom: 4,
            color: '#666',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          커리어 마인드맵을 시작하기 위해 이메일을 입력해주세요
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="이메일"
            variant="outlined"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            sx={{
              marginBottom: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#2196F3',
                },
                '&:hover fieldset': {
                  borderColor: '#1976D2',
                },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              padding: '12px',
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              },
            }}
          >
            시작하기
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EmailForm; 