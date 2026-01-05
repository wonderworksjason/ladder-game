import { useState, useEffect } from 'react';
import styles from './InputForm.module.css';

function InputForm({ onStartGame }) {
  const [players, setPlayers] = useState(['', '', '']);
  const [playerInput, setPlayerInput] = useState('');

  // 참가자 수에 맞춰 자동으로 성공/실패 결과 생성
  const generateResults = (numPlayers) => {
    const results = [];
    const numSuccess = Math.ceil(numPlayers / 2);
    for (let i = 0; i < numSuccess; i++) {
      results.push('성공');
    }
    for (let i = numSuccess; i < numPlayers; i++) {
      results.push('실패');
    }
    return results;
  };

  const addPlayer = () => {
    if (playerInput.trim()) {
      setPlayers([...players, playerInput.trim()]);
      setPlayerInput('');
    }
  };

  const removePlayer = (index) => {
    if (players.length > 3) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const canStart = () => {
    const validPlayers = players.filter(p => p.trim()).length >= 3;
    return validPlayers;
  };

  const handleStart = () => {
    const validPlayers = players.filter(p => p.trim());
    const results = generateResults(validPlayers.length);
    onStartGame(validPlayers, results);
  };

  const validPlayerCount = players.filter(p => p.trim()).length;
  const successCount = Math.ceil(validPlayerCount / 2);
  const failCount = validPlayerCount - successCount;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>사다리 게임</h1>

      <div className={styles.section}>
        <h2>참가자 (최소 3명)</h2>
        <div className={styles.inputGroup}>
          {players.map((player, index) => (
            <div key={index} className={styles.inputRow}>
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={`참가자 ${index + 1}`}
                className={styles.input}
              />
              {players.length > 3 && (
                <button
                  onClick={() => removePlayer(index)}
                  className={styles.removeBtn}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <div className={styles.addRow}>
          <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            placeholder="새 참가자 추가"
            className={styles.input}
          />
          <button onClick={addPlayer} className={styles.addBtn}>
            추가
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>결과</h2>
        <div className={styles.resultInfo}>
          <p>성공: {successCount}개 / 실패: {failCount}개</p>
          <p className={styles.infoText}>결과는 참가자 수에 맞춰 자동으로 생성됩니다</p>
        </div>
      </div>

      {!canStart() && (
        <p className={styles.warning}>
          참가자를 최소 3명 입력해주세요.
        </p>
      )}

      <button
        onClick={handleStart}
        disabled={!canStart()}
        className={styles.startBtn}
      >
        게임 시작
      </button>
    </div>
  );
}

export default InputForm;
