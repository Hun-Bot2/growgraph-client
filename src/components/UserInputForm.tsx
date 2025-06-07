import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';

// Types
export interface UserData {
  hobby: string;
  mbti: string;
  salary: string;
  careerAim: string;
  roleModel: string;
  desiredJobPath: string;
}

interface UserInputFormProps {
  open: boolean;
  onSubmit: (data: UserData) => void;
}

const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

const SALARY_RANGES = [
  '3천만원 ~ 5천만원',
  '5천만원 ~ 7천만원',
  '7천만원 ~ 1억원',
  '1억원 이상'
];

const UserInputForm: React.FC<UserInputFormProps> = ({ open, onSubmit }) => {
  const [formData, setFormData] = useState<UserData>({
    hobby: '',
    mbti: '',
    salary: '',
    careerAim: '',
    roleModel: '',
    desiredJobPath: ''
  });

  const handleTextChange = (field: keyof UserData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field: keyof UserData) => (
    event: SelectChangeEvent
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '20px',
          padding: { xs: '15px', sm: '20px' },
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#1976D2',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: { xs: '1.2rem', sm: '1.5rem' },
      }}>
        커리어 마인드맵 생성
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
            label="관심사/취미"
              value={formData.hobby}
              onChange={handleTextChange('hobby')}
            fullWidth
            variant="outlined"
            sx={{ background: 'rgba(255, 255, 255, 0.9)' }}
            />
          
          <FormControl fullWidth sx={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <InputLabel>MBTI</InputLabel>
              <Select
                value={formData.mbti}
                onChange={handleSelectChange('mbti')}
                label="MBTI"
              >
              {MBTI_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

          <FormControl fullWidth sx={{ background: 'rgba(255, 255, 255, 0.9)' }}>
            <InputLabel>희망 연봉</InputLabel>
            <Select
              value={formData.salary}
              onChange={handleSelectChange('salary')}
              label="희망 연봉"
            >
              {SALARY_RANGES.map(range => (
                <MenuItem key={range} value={range}>{range}</MenuItem>
              ))}
            </Select>
          </FormControl>

            <TextField
            label="커리어 목표"
            value={formData.careerAim}
            onChange={handleTextChange('careerAim')}
              fullWidth
            variant="outlined"
            sx={{ background: 'rgba(255, 255, 255, 0.9)' }}
          />

            <TextField
            label="롤모델"
              value={formData.roleModel}
              onChange={handleTextChange('roleModel')}
            fullWidth
            variant="outlined"
            sx={{ background: 'rgba(255, 255, 255, 0.9)' }}
            />

            <TextField
            label="희망 직무"
            value={formData.desiredJobPath}
            onChange={handleTextChange('desiredJobPath')}
              fullWidth
            variant="outlined"
            sx={{ background: 'rgba(255, 255, 255, 0.9)' }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            },
          }}
        >
          마인드맵 생성
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserInputForm; 