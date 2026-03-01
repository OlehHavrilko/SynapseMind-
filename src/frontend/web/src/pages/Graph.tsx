import { useEffect, useRef, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import './Graph.css';

const GET_GRAPH = gql`
  query GetKnowledgeGraph {
    knowledgeGraph {
      nodes {
        id
        name
        importance
      }
      edges {
        id
        source
        target
        relationship
        strength
      }
    }
  }
`;

export default function Graph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const { data, loading } = useQuery(GET_GRAPH);

  useEffect(() => {
    if (!containerRef.current || !data?.knowledgeGraph) return;

    const elements: ElementDefinition[] = [
      ...data.knowledgeGraph.nodes.map((node: any) => ({
        data: {
          id: node.id,
          label: node.name,
          importance: node.importance,
        },
      })),
      ...data.knowledgeGraph.edges.map((edge: any) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.relationship,
        },
      })),
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#6366F1',
            'label': 'data(label)',
            'color': '#F8FAFC',
            'font-size': '12px',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'width': (ele: any) => 20 + (ele.data('importance') || 1) * 20,
            'height': (ele: any) => 20 + (ele.data('importance') || 1) * 20,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#F59E0B',
            'border-width': 3,
            'border-color': '#F8FAFC',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cyRef.current.on('tap', 'node', (evt) => {
      setSelectedNode(evt.target.id());
    });

    cyRef.current.on('tap', (evt) => {
      if (evt.target === cyRef.current) {
        setSelectedNode(null);
      }
    });

    return () => {
      cyRef.current?.destroy();
    };
  }, [data]);

  const handleAddConcept = () => {
    const name = prompt('Enter concept name:');
    if (name && cyRef.current) {
      cyRef.current.add({
        group: 'nodes',
        data: { id: `new-${Date.now()}`, label: name },
      });
      cyRef.current.layout({ name: 'cose', animate: true }).run();
    }
  };

  if (loading) return <div className="loading">Loading knowledge graph...</div>;

  return (
    <div className="graph-page">
      <div className="graph-header">
        <h1>🧠 Knowledge Graph</h1>
        <div className="graph-actions">
          <button onClick={handleAddConcept} className="btn-primary">
            + Add Concept
          </button>
        </div>
      </div>

      <div className="graph-container">
        <div ref={containerRef} className="graph-view" />
        
        {selectedNode && (
          <div className="graph-sidebar">
            <h3>Concept Details</h3>
            <p>ID: {selectedNode}</p>
            <button onClick={() => setSelectedNode(null)} className="btn-close">
              Close
            </button>
          </div>
        )}
      </div>

      <div className="graph-legend">
        <span>🖱️ Click to select • Scroll to zoom • Drag to pan</span>
      </div>
    </div>
  );
}
