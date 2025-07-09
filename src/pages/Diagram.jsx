import React, { useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getDiagramData } from '../api';
import { setDiagramLoading, setDiagramError, setDiagramData } from '../store';
import 'bootstrap/dist/css/bootstrap.min.css';

const NODE_WIDTH = 220;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 28;
const NODE_MARGIN_X = 60;
const NODE_MARGIN_Y = 40;

function isPK(table, col) {
  return table.primary_key && table.primary_key.includes(col.column_name);
}
function isFK(table, col) {
  return (table.foreign_keys || []).some(fk => fk.source_column === col.column_name);
}

function getRelationshipSymbols(type) {
  // Returns [sourceSymbol, targetSymbol]
  if (type === 'OneToOne') return ['1', '1'];
  if (type === 'OneToMany') return ['1', '*'];
  if (type === 'ManyToMany') return ['*', '*'];
  return ['', ''];
}

const Diagram = () => {
  const svgRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nodePositions, setNodePositions] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux store
  const {
    formData,
    selectedSchema,
    selectedTables,
    diagramLoading,
    diagramError,
    diagramData
  } = useSelector(state => state.form);

  // Fetch diagram data when component mounts
  useEffect(() => {
    const fetchDiagramData = async () => {
      if (!formData.dbUrl || !selectedSchema || selectedTables.length === 0) {
        navigate('/connect');
        return;
      }

      if (!diagramData) {
        dispatch(setDiagramLoading(true));
        dispatch(setDiagramError(null));



        const result = await getDiagramData(
          formData.dbUrl,
          selectedSchema,
          selectedTables.join(',')
        );

        if (result.success) {
          dispatch(setDiagramData(result.data.metadata));
        } else {
          dispatch(setDiagramError(result.message));
        }

        dispatch(setDiagramLoading(false));
      }
    };

    fetchDiagramData();
  }, [formData.dbUrl, selectedSchema, selectedTables, diagramData, dispatch, navigate]);

  // Use diagramData as metadata
  const metadata = useMemo(() => diagramData || [], [diagramData]);
  console.log('metadata', metadata)

  // Initial node positions (grid)
  useEffect(() => {
    if (!metadata || metadata.length === 0) return;

    const positions = {};
    const cols = Math.ceil(Math.sqrt(metadata.length));
    metadata.forEach((table, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      positions[table.table_name] = {
        x: NODE_MARGIN_X + col * (NODE_WIDTH + NODE_MARGIN_X),
        y: NODE_MARGIN_Y + row * (HEADER_HEIGHT + ROW_HEIGHT * (table.columns.length + 1) + NODE_MARGIN_Y)
      };
    });
    setNodePositions(positions);
  }, [metadata]);

  // D3 rendering
  useEffect(() => {
    if (!metadata || metadata.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const drag = d3.drag()
      .on('start', function () {
        d3.select(this).raise();
      })
      .on('drag', function (event, d) {
        nodePositions[d.table_name] = {
          x: event.x,
          y: event.y
        };
        setNodePositions({ ...nodePositions });
      });

    // Helper: get column anchor point (center left/right/top/bottom of row)
    function getColumnAnchor(tableName, colName, side = 'right', nodeWidth = NODE_WIDTH) {
      const table = metadata.find(t => t.table_name === tableName);
      const pos = nodePositions[tableName] || { x: 0, y: 0 };
      const colIdx = table.columns.findIndex(c => c.column_name === colName);
      const y = pos.y + HEADER_HEIGHT + ROW_HEIGHT * colIdx + ROW_HEIGHT / 2 + 4;
      if (side === 'left') return { x: pos.x, y };
      if (side === 'right') return { x: pos.x + nodeWidth, y };
      if (side === 'top') return { x: pos.x + nodeWidth / 2, y: pos.y };
      if (side === 'bottom') return { x: pos.x + nodeWidth / 2, y: pos.y + HEADER_HEIGHT + ROW_HEIGHT * table.columns.length };
      return { x: pos.x + nodeWidth, y };
    }

    // Precompute node widths for each table
    const nodeWidths = {};
    metadata.forEach((table) => {
      let maxLen = table.table_name.length;
      table.columns.forEach(col => {
        let icons = [];
        if (isPK(table, col)) icons.push('🔑');
        if (isFK(table, col)) icons.push('🔗');
        const iconStr = icons.join(' ');
        // Estimate: icon + space + col name + space + data type
        const len = (iconStr.length ? iconStr.length + 1 : 0) + col.column_name.length + 2 + (col.data_type ? col.data_type.length : 0);
        if (len > maxLen) maxLen = len;
      });
      // Use a monospace font, so 10px per char is a good estimate, plus padding
      nodeWidths[table.table_name] = Math.max(NODE_WIDTH, maxLen * 10 + 56); // 56px for left/right padding and icons
    });

    // Draw edges first (under nodes)
    metadata.forEach((table) => {
      (table.foreign_keys || []).forEach(fk => {
        // Get node positions and widths
        const sourcePos = nodePositions[table.table_name] || { x: 0, y: 0 };
        const targetPos = nodePositions[fk.target_table] || { x: 0, y: 0 };
        const sourceWidth = nodeWidths[table.table_name] || NODE_WIDTH;
        const targetWidth = nodeWidths[fk.target_table] || NODE_WIDTH;
        // Calculate node centers
        const sourceCenterX = sourcePos.x + sourceWidth / 2;
        const targetCenterX = targetPos.x + targetWidth / 2;
        // Decide anchor sides based on relative positions
        let sourceSide = 'left', targetSide = 'right';
        // If x-centers are close, use top/bottom
        const overlapThreshold = (sourceWidth + targetWidth) / 2 + 24; // 24px buffer
        if (Math.abs(sourceCenterX - targetCenterX) < overlapThreshold) {
          // Vertically aligned: bottom (target) to top (source)
          sourceSide = 'top';
          targetSide = 'bottom';
        } else if (sourcePos.x < targetPos.x - targetWidth / 2) {
          // Source is left of target: right->left
          sourceSide = 'right';
          targetSide = 'left';
        } else if (sourcePos.x > targetPos.x + targetWidth / 2) {
          // Source is right of target: left->right
          sourceSide = 'left';
          targetSide = 'right';
        } else {
          // Default: right->left
          sourceSide = 'right';
          targetSide = 'left';
        }
        // Edge: from target_column (PK, targetSide) to source_column (FK, sourceSide)
        const startAnchor = getColumnAnchor(fk.target_table, fk.target_column, targetSide, targetWidth); // PK
        const endAnchor = getColumnAnchor(table.table_name, fk.source_column, sourceSide, sourceWidth);   // FK
        let pathD;
        if ((sourceSide === 'top' && targetSide === 'bottom') || (sourceSide === 'bottom' && targetSide === 'top')) {
          // Vertical curve
          const dy = endAnchor.y - startAnchor.y;
          const curve = 0.4;
          const c1x = startAnchor.x;
          const c1y = startAnchor.y + dy * curve;
          const c2x = endAnchor.x;
          const c2y = endAnchor.y - dy * curve;
          pathD = `M${startAnchor.x},${startAnchor.y} C${c1x},${c1y} ${c2x},${c2y} ${endAnchor.x},${endAnchor.y}`;
        } else {
          // Horizontal curve
          const dx = endAnchor.x - startAnchor.x;
          const curve = 0.4;
          const c1x = startAnchor.x + dx * curve;
          const c1y = startAnchor.y;
          const c2x = endAnchor.x - dx * curve;
          const c2y = endAnchor.y;
          pathD = `M${startAnchor.x},${startAnchor.y} C${c1x},${c1y} ${c2x},${c2y} ${endAnchor.x},${endAnchor.y}`;
        }
        const pathElem = svg.append('path')
          .attr('d', pathD)
          .attr('stroke', '#0dcaf0')
          .attr('stroke-width', 3)
          .attr('fill', 'none')
          .attr('stroke-dasharray', '8 6')
          .attr('class', 'erd-animated-edge')
          .node();
        // Relationship symbols: source symbol at start, target symbol at end
        const [srcSym, tgtSym] = getRelationshipSymbols(fk.relationship_type);
        if (pathElem) {
          const totalLen = pathElem.getTotalLength();
          // Place source symbol 18px from start, target symbol 18px from end
          const srcPt = pathElem.getPointAtLength(18);
          const tgtPt = pathElem.getPointAtLength(totalLen - 18);
          svg.append('text')
            .attr('x', srcPt.x)
            .attr('y', srcPt.y - 6)
            .attr('font-size', 13)
            .attr('fill', '#0dcaf0')
            .attr('font-weight', 700)
            .attr('text-anchor', 'middle')
            .text(srcSym);
          svg.append('text')
            .attr('x', tgtPt.x)
            .attr('y', tgtPt.y - 6)
            .attr('font-size', 13)
            .attr('fill', '#0dcaf0')
            .attr('font-weight', 700)
            .attr('text-anchor', 'middle')
            .text(tgtSym);
        }
      });
    });

    // Draw nodes
    metadata.forEach((table) => {
      const pos = nodePositions[table.table_name] || { x: 0, y: 0 };
      const nodeWidth = nodeWidths[table.table_name] || NODE_WIDTH;
      const nodeHeight = HEADER_HEIGHT + ROW_HEIGHT * table.columns.length;
      const g = svg.append('g')
        .attr('class', 'erd-table')
        .attr('transform', `translate(${pos.x},${pos.y})`)
        .datum(table)
        .call(drag, table);

      // Node background
      g.append('rect')
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 12)
        .attr('fill', '#232533')
        .attr('stroke', '#0d6efd')
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0 4px 16px #0008)');

      // Header
      g.append('rect')
        .attr('width', nodeWidth)
        .attr('height', HEADER_HEIGHT)
        .attr('rx', 12)
        .attr('fill', '#0d6efd');

      g.append('text')
        .attr('x', nodeWidth / 2)
        .attr('y', HEADER_HEIGHT / 2 + 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', 18)
        .attr('font-weight', 700)
        .attr('fill', '#fff')
        .text(table.table_name);

      // Columns
      table.columns.forEach((col, idx) => {
        const y = HEADER_HEIGHT + ROW_HEIGHT * idx + ROW_HEIGHT / 2 + 4;
        let icons = [];
        if (isPK(table, col)) icons.push('🔑');
        if (isFK(table, col)) icons.push('🔗');
        // Render each icon as a separate text element, spaced horizontally
        let iconX = 16;
        icons.forEach((icon) => {
          g.append('text')
            .attr('x', iconX)
            .attr('y', y)
            .attr('font-size', 15)
            .attr('font-family', 'monospace')
            .attr('fill', icon === '🔑' ? '#ffd700' : '#0dcaf0')
            .text(icon);
          iconX += 18; // 18px gap between icons
        });
        // Add extra padding after the last icon
        const colNameX = iconX + (icons.length > 0 ? 4 : 0); // 4px extra gap if icons present
        g.append('text')
          .attr('x', colNameX)
          .attr('y', y)
          .attr('font-size', 15)
          .attr('font-family', 'monospace')
          .attr('fill', '#fff')
          .text(col.column_name);
        g.append('text')
          .attr('x', nodeWidth - 16)
          .attr('y', y)
          .attr('font-size', 13)
          .attr('font-family', 'monospace')
          .attr('fill', '#adb5bd')
          .attr('text-anchor', 'end')
          .text(col.data_type);
      });
    });

    // Add CSS animation for edges
    d3.select(svgRef.current.parentNode).select('style').remove();
    d3.select(svgRef.current.parentNode)
      .append('style')
      .text(`
        .erd-animated-edge {
          stroke-dasharray: 8 6;
          animation: dashmove 1.2s linear infinite;
        }
        @keyframes dashmove {
          to { stroke-dashoffset: -28; }
        }
      `);
  }, [metadata, nodePositions]);

  // Fullscreen toggle handler
  const handleFullscreen = () => {
    setIsFullscreen(f => !f);
  };

  // Back button handler
  const handleBack = () => {
    navigate('/connect');
  };

  // Loading state
  if (diagramLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card connect-card shadow-lg" style={{ borderRadius: 20, background: 'rgba(10,12,20,0.95)' }}>
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="text-white mb-2">Generating Diagram...</h4>
                <p className="text-secondary">Please wait while we fetch your database schema</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (diagramError) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card connect-card shadow-lg" style={{ borderRadius: 20, background: 'rgba(10,12,20,0.95)' }}>
              <div className="card-body text-center py-5">
                <div className="text-danger mb-3">
                  <i className="bi bi-exclamation-triangle fs-1"></i>
                </div>
                <h4 className="text-white mb-2">Error Loading Diagram</h4>
                <p className="text-secondary mb-4">{diagramError}</p>
                <button className="btn btn-primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>Back to Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!metadata || metadata.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card connect-card shadow-lg" style={{ borderRadius: 20, background: 'rgba(10,12,20,0.95)' }}>
              <div className="card-body text-center py-5">
                <div className="text-secondary mb-3">
                  <i className="bi bi-database fs-1"></i>
                </div>
                <h4 className="text-white mb-2">No Diagram Data</h4>
                <p className="text-secondary mb-4">Please select tables and generate a diagram first</p>
                <button className="btn btn-primary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>Back to Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container-fluid py-4 ${isFullscreen ? 'position-fixed top-0 start-0 w-100 h-100 bg-dark' : ''}`} style={{ zIndex: isFullscreen ? 2000 : 'auto' }}>
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card connect-card shadow-lg" style={{ borderRadius: 20, background: 'rgba(10,12,20,0.95)' }}>
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-0" style={{ borderRadius: '20px 20px 0 0' }}>
              <div>
                <h4 className="mb-0" style={{ color: '#0d6efd', fontWeight: 700 }}>Database Schema Diagram</h4>
                <small className="text-secondary">Entity Relationship Diagram (ERD)</small>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>Back
                </button>
                <button className="btn btn-outline-primary" onClick={handleFullscreen}>
                  {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>
              </div>
            </div>
            <div className="card-body p-0" style={{ height: isFullscreen ? '80vh' : '60vh', background: 'transparent', borderRadius: '0 0 20px 20px' }}>
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagram;