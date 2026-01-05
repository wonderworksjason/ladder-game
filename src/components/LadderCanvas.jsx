import { useEffect, useRef, useState } from 'react';
import { tracePath } from '../utils/ladderLogic';
import styles from './LadderCanvas.module.css';

function LadderCanvas({ players, results, bridges, onReset }) {
  const canvasRef = useRef(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [animationStep, setAnimationStep] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [autoPlayQueue, setAutoPlayQueue] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
  ];

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDING = 100;
  const LADDER_HEIGHT = CANVAS_HEIGHT - PADDING * 2;

  // 컴포넌트 마운트 시 자동 재생 시작
  useEffect(() => {
    const queue = players.map((_, index) => index);
    setAutoPlayQueue(queue);
    setIsAutoPlaying(true);
  }, []);

  // 자동 재생 큐 처리
  useEffect(() => {
    if (isAutoPlaying && autoPlayQueue.length > 0 && !isAnimating) {
      const nextPlayer = autoPlayQueue[0];
      const timer = setTimeout(() => {
        handlePlayerClick(nextPlayer);
        setAutoPlayQueue(prev => prev.slice(1));
      }, 500);
      return () => clearTimeout(timer);
    } else if (isAutoPlaying && autoPlayQueue.length === 0 && !isAnimating) {
      setIsAutoPlaying(false);
    }
  }, [isAutoPlaying, autoPlayQueue, isAnimating]);

  useEffect(() => {
    drawLadder();
  }, [players, bridges, selectedPlayer, animationStep, allResults]);

  useEffect(() => {
    if (isAnimating && animationStep < currentPath.length) {
      const timer = setTimeout(() => {
        setAnimationStep(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else if (isAnimating && animationStep >= currentPath.length) {
      setIsAnimating(false);
      const result = currentPath[currentPath.length - 1].col;
      setFinalResult(result);
      // 모든 결과 저장
      setAllResults(prev => [...prev, { player: selectedPlayer, result }]);
    }
  }, [isAnimating, animationStep, currentPath]);

  const drawLadder = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const numPlayers = players.length;
    const colWidth = (CANVAS_WIDTH - PADDING * 2) / (numPlayers - 1);
    const levelHeight = LADDER_HEIGHT / bridges.length;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 세로선 그리기
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 3;
    for (let i = 0; i < numPlayers; i++) {
      const x = PADDING + i * colWidth;
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, CANVAS_HEIGHT - PADDING);
      ctx.stroke();
    }

    // 가로선 (다리) 그리기
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    bridges.forEach((row, level) => {
      row.forEach((hasBridge, col) => {
        if (hasBridge) {
          const x1 = PADDING + col * colWidth;
          const x2 = PADDING + (col + 1) * colWidth;
          const y = PADDING + (level + 0.5) * levelHeight;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
      });
    });

    // 참가자 이름 그리기
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    players.forEach((player, i) => {
      const x = PADDING + i * colWidth;
      const isSelected = selectedPlayer === i;

      // 배경 원
      ctx.fillStyle = isSelected ? COLORS[i % COLORS.length] : '#ecf0f1';
      ctx.beginPath();
      ctx.arc(x, PADDING - 30, 25, 0, Math.PI * 2);
      ctx.fill();

      // 테두리
      ctx.strokeStyle = COLORS[i % COLORS.length];
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // 텍스트
      ctx.fillStyle = isSelected ? 'white' : '#2c3e50';
      ctx.fillText(player, x, PADDING - 25);
    });

    // 결과 항목 그리기
    results.forEach((result, i) => {
      const x = PADDING + i * colWidth;
      const isResult = finalResult === i;
      const hasResult = allResults.find(r => r.result === i);

      // 배경 원
      if (hasResult) {
        ctx.fillStyle = COLORS[hasResult.player % COLORS.length];
      } else {
        ctx.fillStyle = '#ecf0f1';
      }
      ctx.beginPath();
      ctx.arc(x, CANVAS_HEIGHT - PADDING + 30, 25, 0, Math.PI * 2);
      ctx.fill();

      // 테두리
      if (hasResult) {
        ctx.strokeStyle = COLORS[hasResult.player % COLORS.length];
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // 텍스트
      ctx.fillStyle = hasResult ? 'white' : '#2c3e50';
      ctx.fillText(result, x, CANVAS_HEIGHT - PADDING + 35);
    });

    // 애니메이션 경로 그리기
    if (selectedPlayer !== null && animationStep > 0) {
      ctx.strokeStyle = COLORS[selectedPlayer % COLORS.length];
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      for (let i = 0; i < Math.min(animationStep, currentPath.length - 1); i++) {
        const current = currentPath[i];
        const next = currentPath[i + 1];

        const x1 = PADDING + current.col * colWidth;
        const y1 = current.level === -1 ? PADDING : PADDING + (current.level + 0.5) * levelHeight;
        const x2 = PADDING + next.col * colWidth;
        const y2 = next.level === -1 ? PADDING :
                   next.level === bridges.length ? CANVAS_HEIGHT - PADDING :
                   PADDING + (next.level + 0.5) * levelHeight;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 현재 위치에 마커 그리기
      if (animationStep < currentPath.length) {
        const pos = currentPath[animationStep];
        const x = PADDING + pos.col * colWidth;
        const y = pos.level === -1 ? PADDING :
                  pos.level === bridges.length ? CANVAS_HEIGHT - PADDING :
                  PADDING + (pos.level + 0.5) * levelHeight;

        ctx.fillStyle = COLORS[selectedPlayer % COLORS.length];
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const handlePlayerClick = (index) => {
    if (isAnimating) return;

    setSelectedPlayer(index);
    setFinalResult(null);
    const path = tracePath(index, bridges, players.length);
    setCurrentPath(path);
    setAnimationStep(0);
    setIsAnimating(true);
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={styles.canvas}
      />

      {allResults.length === players.length && (
        <div className={styles.allResults}>
          <h2>모든 참가자의 결과</h2>
          <div className={styles.resultList}>
            {players.map((player, index) => {
              const playerResult = allResults.find(r => r.player === index);
              return (
                <div key={index} className={styles.resultItem}>
                  <span className={styles.playerName} style={{ color: COLORS[index % COLORS.length] }}>
                    {player}
                  </span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.resultText}>
                    {playerResult ? results[playerResult.result] : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button onClick={onReset} className={styles.resetBtn}>
        다시 시작
      </button>
    </div>
  );
}

export default LadderCanvas;
