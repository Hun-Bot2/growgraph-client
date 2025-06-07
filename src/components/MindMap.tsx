import React, { useState, useCallback } from 'react';
import ReactFlow, {
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
} from 'reactflow';
import 'reactflow/dist/base.css';
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
}

interface MindMapProps {
  initialData: {
    nodes: Node[];
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

const CustomNode = ({ data }: { data: { label: string } }) => (
  <div style={nodeStyles}>
    <div style={{
      fontWeight: 'bold',
      fontSize: '0.95rem',
      color: '#1976D2',
      wordBreak: 'break-word',
      lineHeight: '1.3',
    }}>
      {data.label || 'No Label'}
    </div>
  </div>
);

// **여기서 nodeTypes를 컴포넌트 밖에서 선언**
const nodeTypes = {
  custom: CustomNode,
};

const maxChildren = 7; // 한 부모 아래 최대 자식 수

const MindMap: React.FC<MindMapProps> = ({ initialData }) => {
  // 초기 노드와 엣지 데이터를 올바르게 변환
  const initialNodes: Node[] = initialData.nodes.map(node => {
    let label = node.id;
    if (node.data && typeof node.data === 'object' && 'label' in node.data && node.data.label) {
      label = node.data.label;
    } else if (typeof node.data === 'string' && node.data) {
      label = node.data;
    } else if (Array.isArray(node.data) && typeof node.data[0] === 'string') {
      label = node.data[0];
    } else if (node.data && typeof node.data === 'object') {
      if (node.data.name) label = node.data.name;
      else if (node.data.title) label = node.data.title;
      else if (node.data.text) label = node.data.text;
      else if (node.data.value) label = node.data.value;
    }
    // 디버깅용 로그
    console.log('[CLIENT] node:', node, '추출된 label:', label);
    return {
      ...node,
      data: { label },
      type: 'custom',
    };
  });

  const initialEdges: Edge[] = initialData.edges.map(edge => ({
    ...edge,
    animated: true,
    style: { stroke: '#1565c0', strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#1565c0',
      width: 32,
      height: 32,
      strokeWidth: 2
    }
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [childCounts, setChildCounts] = useState<{ [parentId: string]: number }>({});
  const [careerDetail, setCareerDetail] = useState<CareerDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  console.log('초기 노드 라벨:', initialNodes.map(n => n.data.label));

  const handleNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/suggestions`, {
        nodeContent: node.data.label
      });
      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    } catch (err) {
      setErrorMessage('추천 결과를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 추천 리스트에서 직업명 클릭 시 상세 정보 요청
  const handleSuggestionClick = async (label: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/career-details`, { careerTitle: label });
      setCareerDetail(response.data);
      setShowDetailModal(true);
    } catch {
      setCareerDetail({
        title: label,
        averageSalary: '',
        requirements: { education: [], certifications: [], experience: [] },
        description: '상세 정보를 불러오지 못했습니다.',
        relatedCompanies: [],
        roleModels: []
      });
      setShowDetailModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 상세 정보 모달에서 '마인드맵에 추가' 클릭 시
  const handleAddToMindMap = () => {
    if (!selectedNode || !careerDetail) return;
    const count = childCounts[selectedNode.id] || 0;
    const angleStep = Math.PI / (maxChildren + 1); // ex: 22.5도씩
    const baseAngle = Math.PI / 2; // 90도(아래쪽)
    const angle = baseAngle + (count - (maxChildren - 1) / 2) * angleStep;
    const radius = 260; // 부모와 자식 간 거리
    const newNode = {
      id: `${selectedNode.id}-${careerDetail.title}`,
      position: {
        x: selectedNode.position.x + Math.cos(angle) * radius,
        y: selectedNode.position.y + Math.sin(angle) * radius
      },
      data: { label: careerDetail.title },
      type: 'custom',
    };
    const newEdge = {
      id: `e${selectedNode.id}-${newNode.id}`,
      source: selectedNode.id,
      target: newNode.id,
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
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setChildCounts((prev) => ({
      ...prev,
      [selectedNode.id]: count + 1
    }));
    setShowDetailModal(false);
    setShowSuggestions(false);
  };

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
        onConnect={params => setEdges(eds => addEdge(params, eds))}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
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
      {showDetailModal && careerDetail && (
        <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 620, p: 5, outline: 'none', maxHeight: '90vh', overflowY: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center', color: '#1976D2' }}>{careerDetail.title}</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>직무 설명</Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#444', fontSize: 17 }}>{careerDetail.description}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>평균 연봉</Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#444', fontSize: 17 }}>{careerDetail.averageSalary}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>필요 요건</Typography>
              <Typography variant="body2" sx={{ color: '#444', fontSize: 16 }}>
                <b>학력:</b> {careerDetail.requirements.education.join(', ') || '-'}<br/>
                <b>자격증:</b> {careerDetail.requirements.certifications.join(', ') || '-'}<br/>
                <b>경력:</b> {careerDetail.requirements.experience.join(', ') || '-'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>관련 기업</Typography>
              <Typography variant="body2" sx={{ color: '#444', fontSize: 16 }}>{careerDetail.relatedCompanies.join(', ') || '-'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>롤모델</Typography>
              <Typography variant="body2" sx={{ color: '#444', fontSize: 16 }}>{careerDetail.roleModels.join(', ') || '-'}</Typography>
            </Box>
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, fontSize: 18, py: 1.5 }} onClick={handleAddToMindMap}>마인드맵에 추가</Button>
            <Button variant="text" color="secondary" fullWidth sx={{ mt: 1, fontSize: 16 }} onClick={() => setShowDetailModal(false)}>닫기</Button>
          </Paper>
        </Modal>
      )}
    </div>
  );
};

export default MindMap; 