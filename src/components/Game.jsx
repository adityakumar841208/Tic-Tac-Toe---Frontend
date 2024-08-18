import React, { useState, useEffect } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import config from '../config';

const client = new W3CWebSocket(config.URL);


const Game = () => {
    const [gameWinStatus, setWinStatus] = useState('')
    const [player, setPlayer] = useState(null);
    const [turn, setTurn] = useState('');
    const [board, setBoard] = useState(Array(9).fill(null));
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        console.log(config)
        client.onmessage = (message) => {
            try {
                const data = JSON.parse(message.data);
                if (data.type === 'start') {
                    setTurn(data.turn);
                    setPlayer(data.player);
                }
                else if (data.type === 'info') {
                    setPlayer(data.msg)
                    return
                } else if (data.type === 'update') {
                    console.log("update is called")
                    setTurn(data.turn);
                    setBoard(data.board);
                } else if (data.type === 'end' && data.winner) {
                    setBoard(data.board);
                    setTurn('none')
                    setWinStatus(`Game Over Winner Is: ${data.winner}`)
                    setGameOver(true)
                } else if (data.type === 'end' && data.msg) {
                    setWinStatus(`Opponent disconnected reloading in 5 seconds.`)
                    setTimeout(() => {
                        window.location.reload()
                    }, 5000)
                }

            } catch (error) {
                console.log(error)
            }
        };

        return () => {
            if (client.readyState === WebSocket.OPEN) {
                client.close();
            }
        };
    }, []);

    const handleClick = (index) => {
        if (turn === player && !board[index] && !gameOver) {
            const newBoard = board.slice();
            newBoard[index] = turn;
            setBoard(newBoard);
            client.send(JSON.stringify({ index: index, type: 'move', turn: turn }));
            setTurn(turn === 'X' ? 'O' : 'X');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Tic-Tac-Toe</h1>
            <h1 className='mb-4 font-bold text-2xl p-10'>{gameWinStatus}</h1>
            <div className="grid grid-cols-3 gap-0 w-60">
                {board.map((cell, index) => (
                    <div
                        key={index}
                        className="w-20 h-20 flex items-center justify-center bg-white border border-gray-400 text-3xl font-bold cursor-pointer"
                        onClick={() => handleClick(index)}
                    >
                        {cell}
                    </div>
                ))}
            </div>
            <p className="mt-8 text-xl">
                {
                    turn === '' && player !== 'waiting for opponent' ? (
                        <span>Please Reload...</span>
                    ) : (
                        turn === '' ? (
                            <span className="font-bold">Current Turn: will be declared soon</span>
                        ) : (
                            <span className="font-bold">Current Turn: {turn}</span>
                        )
                    )
                }
            </p>
            <p className="mt-4 text-lg">
                {
                    player === "waiting for opponent" ? (
                        <span>waiting for opponent</span>
                    ) : (
                        <span className="font-bold">You are:{player}</span>
                    )
                }

            </p>
        </div>
    );
};

export default Game;
