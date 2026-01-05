import { useState } from 'react';
import InputForm from './InputForm';
import LadderCanvas from './LadderCanvas';
import { generateLadder } from '../utils/ladderLogic';
import styles from './LadderGame.module.css';

function LadderGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState([]);
  const [bridges, setBridges] = useState([]);

  const handleStartGame = (playerList, resultList) => {
    setPlayers(playerList);
    setResults(resultList);
    const ladder = generateLadder(playerList.length);
    setBridges(ladder);
    setGameStarted(true);
  };

  const handleReset = () => {
    setGameStarted(false);
    setPlayers([]);
    setResults([]);
    setBridges([]);
  };

  return (
    <div className={styles.container}>
      {!gameStarted ? (
        <InputForm onStartGame={handleStartGame} />
      ) : (
        <LadderCanvas
          players={players}
          results={results}
          bridges={bridges}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default LadderGame;
