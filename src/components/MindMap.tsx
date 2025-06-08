import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import { CircularProgress, Box, Typography, Button, Modal, Paper } from '@mui/material';

// Types
interface NodeData {
  label: string;
}

interface CareerDetail {
  title: string;
  averageSalary: string;
  requirements: {
    education: string[];
    certifications: string[];
    experience: string[];
  };
  description: string;
  relatedCompanies: string[];
  roleModels: string[];
  timeToReach?: {
    신입: string;
    주니어: string;
    시니어: string;
    리드: string;
  };
}

interface ServerResponse {
  title: string;
  averageSalary: string;
  requirements: {
    education: string[];
    certifications: string[];
    experience: string[];
  };
  description: string;
  relatedCompanies: string[];
  roleModels: string[];
  timeToReach?: {
    신입: string;
    주니어: string;
    시니어: string;
    리드: string;
  };
}

interface MindMapProps {
  initialData: {
    nodes: Node<any>[];
    edges: Edge[];
  };
}

// API URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Custom node styles
const nodeStyles = {
  background: '#fff',
  border: '2px solid #2196F3',
  borderRadius: '10px',
  padding: '12px 20px',
  minWidth: '180px',
  maxWidth: '250px',
  textAlign: 'center' as const,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};

// Custom Node Component
const CustomNode = ({ data }: { data: NodeData }) => (
  <div style={nodeStyles}>
    <Handle type="target" position={Position.Top} />
    <div style={{
      fontWeight: 'bold',
      fontSize: '0.95rem',
      color: '#1976D2',
      wordBreak: 'break-word',
      lineHeight: '1.3',
    }}>
      {data.label || 'No Label'}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

// Define nodeTypes outside of component
const nodeTypes = {
  custom: CustomNode,
};

const maxChildren = 7; // 한 부모 아래 최대 자식 수

const defaultCareerDetail: CareerDetail = {
  title: '',
  averageSalary: '',
  requirements: {
    education: [],
    certifications: [],
    experience: []
  },
  description: '',
  relatedCompanies: [],
  roleModels: []
};

// Helper function to safely extract label from node data
const extractLabel = (nodeData: any): string => {
  if (!nodeData) return 'No Label';
  
  // Case 1: data has label property
  if (typeof nodeData === 'object' && nodeData.label && typeof nodeData.label === 'string') {
    return nodeData.label;
  }
  
  // Case 2: data is a string
  if (typeof nodeData === 'string') {
    return nodeData;
  }
  
  // Case 3: data is an array with string first element
  if (Array.isArray(nodeData) && nodeData.length > 0 && typeof nodeData[0] === 'string') {
    return nodeData[0];
  }
  
  // Case 4: data has alternative properties
  if (typeof nodeData === 'object') {
    if (nodeData.name && typeof nodeData.name === 'string') return nodeData.name;
    if (nodeData.title && typeof nodeData.title === 'string') return nodeData.title;
    if (nodeData.text && typeof nodeData.text === 'string') return nodeData.text;
    if (nodeData.value && typeof nodeData.value === 'string') return nodeData.value;
  }
  
  return 'No Label';
};

// Helper function to safely validate and transform server response
const validateServerResponse = (data: any): CareerDetail => {
  if (!data || typeof data !== 'object') {
    return defaultCareerDetail;
  }

  return {
    title: typeof data.title === 'string' ? data.title : '',
    averageSalary: typeof data.averageSalary === 'string' ? data.averageSalary : '',
    requirements: {
      education: Array.isArray(data.requirements?.education) 
        ? data.requirements.education.filter((item: any) => typeof item === 'string') 
        : [],
      certifications: Array.isArray(data.requirements?.certifications) 
        ? data.requirements.certifications.filter((item: any) => typeof item === 'string') 
        : [],
      experience: Array.isArray(data.requirements?.experience) 
        ? data.requirements.experience.filter((item: any) => typeof item === 'string') 
        : []
    },
    description: typeof data.description === 'string' ? data.description : '',
    relatedCompanies: Array.isArray(data.relatedCompanies) 
      ? data.relatedCompanies.filter((item: any) => typeof item === 'string') 
      : [],
    roleModels: Array.isArray(data.roleModels) 
      ? data.roleModels.filter((item: any) => typeof item === 'string') 
      : [],
    timeToReach: data.timeToReach && typeof data.timeToReach === 'object' 
      ? data.timeToReach 
      : undefined
  };
};

const MindMap: React.FC<MindMapProps> = ({ initialData }) => {
  // Debug initial data
  

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<any> | null>(null);
  const [childCounts, setChildCounts] = useState<{ [parentId: string]: number }>({});
  const [selectedCareer, setSelectedCareer] = useState<CareerDetail | null>(null);
  const [careerDetails, setCareerDetails] = useState<CareerDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);


  useEffect(() => {
    if (!initialData) return;

    const initialNodes = initialData.nodes.map((node: any, index: number) => {
      const label = node.data?.label || `Node ${index + 1}`;
      return {
        id: node.id,
        type: 'custom',
        position: node.position,
        data: { label },
      };
    });

    const initialEdges = initialData.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialData]);

  const handleNodeClick = useCallback(async (event: React.MouseEvent, node: Node<any>) => {
    setSelectedNode(node);
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await axios.post(`${API_URL}/suggestions`, {
        nodeContent: node.data.label
      });
      
      if (response.data && Array.isArray(response.data.suggestions)) {
        setSuggestions(response.data.suggestions.filter((item: any) => typeof item === 'string'));
        setShowSuggestions(true);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setErrorMessage('추천 결과를 불러오지 못했습니다.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 추천 리스트에서 직업명 클릭 시 상세 정보 요청
  const handleSuggestionClick = async (label: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await axios.post(`${API_URL}/career-details`, { careerTitle: label });
      const validatedData = validateServerResponse(response.data);
      setCareerDetails(validatedData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching career details:', error);
      setCareerDetails({
        ...defaultCareerDetail,
        title: label,
        description: '상세 정보를 불러오지 못했습니다.',
      });
      setShowDetailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 상세 정보 모달에서 '마인드맵에 추가' 클릭 시
  const handleAddToMindMap = () => {
    if (!selectedNode || !careerDetails) return;
    
  
    // Calculate position for new node
    const count = childCounts[selectedNode.id] || 0;
    const angleStep = Math.PI / (maxChildren + 1);
    const baseAngle = Math.PI / 2;
    const angle = baseAngle + (count - (maxChildren - 1) / 2) * angleStep;
    const radius = 260;
    
    // Create new node
    const newNode: Node<any> = {
      id: `${selectedNode.id}-${Date.now()}`,
      position: {
        x: selectedNode.position.x + Math.cos(angle) * radius,
        y: selectedNode.position.y + Math.sin(angle) * radius
      },
      data: { label: careerDetails.title },
      type: 'custom',
    };

    // Create new edge
    const newEdge: Edge = {
      id: `e${selectedNode.id}-${newNode.id}`,
      source: selectedNode.id,
      target: newNode.id,
      type: 'step',
      animated: true,
      style: { stroke: '#1565c0', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#1565c0',
        width: 32,
        height: 32,
        strokeWidth: 2
      }
    };

    

    // Update state
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setChildCounts((prev) => ({
      ...prev,
      [selectedNode.id]: count + 1
    }));

    // Close modals
    setShowDetailModal(false);
    setShowSuggestions(false);
  };

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" style={{ marginTop: '20px', color: '#1976D2' }}>
          노드를 확장하고 있습니다...
        </Typography>
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Typography color="error">{errorMessage}</Typography>
      </Box>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* GrowGraph 로고/글씨 */}
      <Box sx={{
        position: 'absolute', top: 24, left: 32, zIndex: 3000,
        fontWeight: 'bold', fontSize: 36, color: '#1976D2', letterSpacing: 2,
        textShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
      }}>
        GrowGraph
      </Box>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'step',
          animated: true,
          style: { stroke: '#1565c0', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#1565c0',
            width: 32,
            height: 32,
            strokeWidth: 2
          }
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      {showSuggestions && (
        <Modal open={showSuggestions} onClose={() => setShowSuggestions(false)}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4, outline: 'none' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>추천 경로</Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{ marginBottom: 12 }}>
                  <Button variant="outlined" fullWidth onClick={() => handleSuggestionClick(s)}>{s}</Button>
                </li>
              ))}
            </ul>
            <Button onClick={() => setShowSuggestions(false)} variant="text" color="secondary" fullWidth>닫기</Button>
          </Paper>
        </Modal>
      )}
      
      {showDetailModal && careerDetails && (
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 620, p: 5, outline: 'none', maxHeight: '90vh', overflowY: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center', color: '#1976D2' }}>{careerDetails.title}</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>직무 설명</Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#444', fontSize: 17 }}>{careerDetails.description}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>평균 연봉</Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#444', fontSize: 17 }}>{careerDetails.averageSalary}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>필요 요건</Typography>
              <Typography variant="body2" sx={{ color: '#444', fontSize: 16 }}>
                <b>학력:</b> {careerDetails.requirements.education.join(', ') || '-'}<br/>
                <b>자격증:</b> {careerDetails.requirements.certifications.join(', ') || '-'}<br/>
                <b>경력:</b> {careerDetails.requirements.experience.join(', ') || '-'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>관련 기업</Typography>
              <Typography variant="body2" sx={{ color: '#444', fontSize: 16 }}>{careerDetails.relatedCompanies.join(', ') || '-'}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>롤모델</Typography>
              <Typography variant="body2" sx={{ color: '#444', fontSize: 16 }}>{careerDetails.roleModels.join(', ') || '-'}</Typography>
            </Box>

            {careerDetails.timeToReach && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>커리어 달성 시간</Typography>
                <Typography variant="body2" sx={{ color: '#444', fontSize: 16 }}>
                  <b>신입:</b> {careerDetails.timeToReach.신입}<br/>
                  <b>주니어:</b> {careerDetails.timeToReach.주니어}<br/>
                  <b>시니어:</b> {careerDetails.timeToReach.시니어}<br/>
                  <b>리드:</b> {careerDetails.timeToReach.리드}
                </Typography>
              </Box>
            )}
            
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, fontSize: 18, py: 1.5 }} onClick={handleAddToMindMap}>마인드맵에 추가</Button>
            <Button variant="text" color="secondary" fullWidth sx={{ mt: 1, fontSize: 16 }} onClick={() => setShowDetailModal(false)}>닫기</Button>
          </Paper>
        </Modal>
      )}
    </div>
  );
};

export default MindMap;