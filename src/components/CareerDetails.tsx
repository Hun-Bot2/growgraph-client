import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

export interface CareerInfo {
  title: string;
  description: string;
  requirements: {
    education: string[];
    certifications: string[];
    experience: string[];
  };
  averageSalary: string;
  relatedCompanies: string[];
  roleModels: string[];
}

interface CareerDetailsProps {
  open: boolean;
  onClose: () => void;
  careerInfo: CareerInfo | null;
}

const CareerDetails: React.FC<CareerDetailsProps> = ({ open, onClose, careerInfo }) => {
  if (!careerInfo) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        {careerInfo.title}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>
            직무 설명
          </Typography>
          <Typography paragraph>
            {careerInfo.description}
          </Typography>

          <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>
            평균 연봉
          </Typography>
          <Typography paragraph>
            {careerInfo.averageSalary}
          </Typography>

          <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>
            필요 요건
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="학력"
                secondary={careerInfo.requirements.education.join(', ')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="자격증"
                secondary={careerInfo.requirements.certifications.join(', ')}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="경력"
                secondary={careerInfo.requirements.experience.join(', ')}
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>
            관련 기업
          </Typography>
          <Typography paragraph>
            {careerInfo.relatedCompanies.join(', ')}
          </Typography>

          <Typography variant="h6" sx={{ color: '#1976D2', mb: 1 }}>
            롤모델
          </Typography>
          <Typography paragraph>
            {careerInfo.roleModels.join(', ')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            },
          }}
        >
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CareerDetails; 