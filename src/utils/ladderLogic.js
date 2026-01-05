// 사다리 생성 및 경로 계산 로직

/**
 * 사다리 데이터 생성
 * @param {number} numPlayers - 참가자 수
 * @param {number} numLevels - 사다리 높이 (가로선 개수)
 * @returns {Array} - 2D 배열, bridges[level][col] = true면 해당 위치에 다리가 있음
 */
export function generateLadder(numPlayers, numLevels = 20) {
  const bridges = [];

  // 각 레벨마다 가로 다리 생성
  for (let level = 0; level < numLevels; level++) {
    const row = Array(numPlayers - 1).fill(false);

    // 랜덤하게 다리 배치 (약 30-50% 확률로 다리 생성)
    for (let col = 0; col < numPlayers - 1; col++) {
      // 이전 다리와 연속되지 않도록 체크
      if (col === 0 || !row[col - 1]) {
        // 30-50% 확률로 다리 생성
        if (Math.random() < 0.4) {
          row[col] = true;
        }
      }
    }

    bridges.push(row);
  }

  return bridges;
}

/**
 * 시작 위치에서 경로 추적
 * @param {number} startCol - 시작 컬럼 (0부터 시작)
 * @param {Array} bridges - 사다리 데이터
 * @param {number} numPlayers - 참가자 수
 * @returns {Array} - [{col, level}, ...] 형태의 경로 배열
 */
export function tracePath(startCol, bridges, numPlayers) {
  const path = [];
  let currentCol = startCol;

  // 시작 지점
  path.push({ col: currentCol, level: -1 });

  // 각 레벨을 내려가면서 경로 추적
  for (let level = 0; level < bridges.length; level++) {
    // 왼쪽에 다리가 있는지 확인
    if (currentCol > 0 && bridges[level][currentCol - 1]) {
      // 왼쪽으로 이동
      path.push({ col: currentCol, level });
      currentCol--;
      path.push({ col: currentCol, level });
    }
    // 오른쪽에 다리가 있는지 확인
    else if (currentCol < numPlayers - 1 && bridges[level][currentCol]) {
      // 오른쪽으로 이동
      path.push({ col: currentCol, level });
      currentCol++;
      path.push({ col: currentCol, level });
    } else {
      // 다리가 없으면 그대로 아래로
      path.push({ col: currentCol, level });
    }
  }

  // 종료 지점
  path.push({ col: currentCol, level: bridges.length });

  return path;
}

/**
 * 모든 참가자의 결과를 미리 계산
 * @param {Array} bridges - 사다리 데이터
 * @param {number} numPlayers - 참가자 수
 * @returns {Array} - 각 참가자의 최종 도착 컬럼
 */
export function calculateAllResults(bridges, numPlayers) {
  const results = [];

  for (let i = 0; i < numPlayers; i++) {
    const path = tracePath(i, bridges, numPlayers);
    const finalPosition = path[path.length - 1].col;
    results[i] = finalPosition;
  }

  return results;
}
