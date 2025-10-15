import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import { useWorkflow } from '../contexts/WorkflowContext';
import { FiGitBranch, FiRefreshCw, FiDownload, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const MindMapGeneration = () => {
  const { paperId, metadata } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const breadcrumbs = [
    { label: 'Output Selection', href: '/output-selection' },
    { label: 'Mind Map', href: '/mindmap-generation' }
  ];

  useEffect(() => {
    checkMindMapStatus();
  }, [paperId]);

  useEffect(() => {
    if (mindMapData) {
      const { nodes: newNodes, edges: newEdges } = convertToReactFlow(mindMapData);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [mindMapData]);

  const checkMindMapStatus = async () => {
    try {
      const response = await api.get(`/mindmaps/${paperId}/status`);
      if (response.data.exists) {
        setMindMapData(response.data.mindmap_data);
      }
    } catch (error) {
      console.log('No existing mind map found');
    }
  };

  const generateMindMap = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/mindmaps/${paperId}/generate`);
      setMindMapData(response.data.mindmap_data);
      toast.success('Mind map generated successfully!');
    } catch (error) {
      console.error('Error generating mind map:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate mind map');
    } finally {
      setIsGenerating(false);
    }
  };

  const convertToReactFlow = (data) => {
    if (!data || !data.nodes) return { nodes: [], edges: [] };

    const reactFlowNodes = [];
    const reactFlowEdges = [];

    // Define node styles by level
    const getNodeStyle = (level) => {
      const styles = {
        0: { // Root
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '20px 30px',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
          border: 'none',
          minWidth: '200px'
        },
        1: { // Main branches
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          padding: '15px 25px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
          border: 'none',
          minWidth: '180px'
        },
        2: { // Sub-branches
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 6px 15px rgba(79, 172, 254, 0.3)',
          border: 'none',
          minWidth: '150px'
        },
        3: { // Leaf nodes
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          fontSize: '13px',
          padding: '10px 18px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
          border: 'none',
          minWidth: '130px'
        }
      };
      return styles[level] || styles[3];
    };

    // Calculate positions in a radial/hierarchical layout
    const positionNodes = (node, parentPos = { x: 400, y: 50 }, level = 0, index = 0, totalSiblings = 1) => {
      const horizontalSpacing = 300;
      const verticalSpacing = 150;
      
      let x, y;
      
      if (level === 0) {
        // Root at center top
        x = parentPos.x;
        y = parentPos.y;
      } else {
        // Distribute children horizontally
        const totalWidth = (totalSiblings - 1) * horizontalSpacing;
        const startX = parentPos.x - totalWidth / 2;
        x = startX + (index * horizontalSpacing);
        y = parentPos.y + verticalSpacing;
      }

      const nodeId = node.id;
      const nodeData = {
        id: nodeId,
        type: 'default',
        position: { x, y },
        data: { 
          label: node.label || node.text
        },
        style: getNodeStyle(level),
        sourcePosition: 'bottom',
        targetPosition: 'top'
      };

      reactFlowNodes.push(nodeData);

      // Process children
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, childIndex) => {
          const childId = child.id || `${nodeId}-child-${childIndex}`;
          child.id = childId;
          
          positionNodes(
            child,
            { x, y },
            level + 1,
            childIndex,
            node.children.length
          );

          // Create edge from parent to child
          reactFlowEdges.push({
            id: `edge-${nodeId}-${childId}`,
            source: nodeId,
            target: childId,
            type: 'smoothstep',
            animated: level < 2,
            style: {
              stroke: level === 0 ? '#667eea' : level === 1 ? '#f093fb' : '#4facfe',
              strokeWidth: level === 0 ? 3 : 2
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: level === 0 ? '#667eea' : level === 1 ? '#f093fb' : '#4facfe',
            }
          });
        });
      }
    };

    if (data.nodes.length > 0) {
      positionNodes(data.nodes[0]);
    }

    return { nodes: reactFlowNodes, edges: reactFlowEdges };
  };

  const downloadMindMap = () => {
    const blob = new Blob([JSON.stringify(mindMapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata?.title || 'paper'}_mindmap.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Mind map downloaded!');
  };

  if (!paperId) {
    return (
      <Layout title="Mind Map" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiGitBranch className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to generate mind map.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Mind Map Generation" breadcrumbs={breadcrumbs}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <FiGitBranch className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Mind Map</h2>
                <p className="text-indigo-100">Visualize key concepts and relationships</p>
              </div>
            </div>
            {mindMapData && (
              <button
                onClick={downloadMindMap}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-4">
            <p className="font-semibold">{metadata?.title || 'Research Paper'}</p>
          </div>
        </div>

        {/* Generate Button */}
        {!mindMapData && (
          <motion.button
            onClick={generateMindMap}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
              ${isGenerating
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl'
              }
            `}
          >
            {isGenerating ? (
              <>
                <FiRefreshCw className="w-6 h-6 animate-spin" />
                Generating Mind Map...
              </>
            ) : (
              <>
                <FiGitBranch className="w-6 h-6" />
                Generate Mind Map
              </>
            )}
          </motion.button>
        )}

        {/* Mind Map Display */}
        {mindMapData && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border-2 border-indigo-200 dark:border-indigo-700 overflow-hidden">
            <div className="h-[700px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-left"
              >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap 
                  nodeColor={(node) => {
                    return node.style?.background || '#667eea';
                  }}
                  maskColor="rgb(240, 240, 240, 0.8)"
                />
              </ReactFlow>
            </div>

            {/* Regenerate Button */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setMindMapData(null);
                  setNodes([]);
                  setEdges([]);
                }}
                className="w-full py-3 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Generate New Mind Map
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default MindMapGeneration;
