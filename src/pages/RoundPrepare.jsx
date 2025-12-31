// src/pages/RoundPrepare.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/StorageService';
import { generateOptimizedMultiRounds } from '../logic/matching';

const RoundPrepare = () => {
    const { filename } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [roundsPreview, setRoundsPreview] = useState([]);
    const [roundCount, setRoundCount] = useState(4); // デフォルト4回戦分

    const createPreview = (tData, count) => {
        // 従来のランダム生成ではなく、最適化された一括生成を呼び出す
        const result = generateOptimizedMultiRounds(tData.players, tData.tournament_info.max_tables, count);
        setRoundsPreview(result);
    };

    useEffect(() => {
        const tData = StorageService.getTournament(filename);
        if (tData) {
            setTournament(tData);
            // 大会設定の対局数を初期値にする（数値に変換）
            const defaultCount = parseInt(tData.tournament_info.max_games) || 4;
            setRoundCount(defaultCount);
            createPreview(tData, defaultCount);
        } else {
            alert("大会データが見つかりません");
        }
    }, [filename]);

    const handleConfirm = () => {
        StorageService.saveAllRounds(filename, roundsPreview);
        navigate(`/t/${filename}/round/1`); // 1回戦の卓一覧へ
    };

    if (!tournament) return <div>読み込み中...</div>;
    const playerMap = Object.fromEntries(tournament.players.map(p => [p.id, p]));

    return (
        <div className="round-prepare">
            <h1 className="page-title">全回戦の一括卓組み案</h1>
            
            <div className="config-row" style={{marginBottom: '20px'}}>
                <label>生成する回戦数：</label>
                <input type="number" value={roundCount} min="1" max="10" 
                       onChange={(e) => {
                           const val = Number(e.target.value);
                           setRoundCount(val);
                           createPreview(tournament, val);
                       }} />
                <button className="btn-outline" onClick={() => createPreview(tournament, roundCount)}>再シャッフル</button>
            </div>

            <div className="multi-round-list">
                {roundsPreview?.map(round => (
                    <div key={round.round_number} className="round-preview-section">
                        <h3>第 {round.round_number} 回戦</h3>
                        <div className="tables-grid">
                            {round.tables.map(table => (
                                <div key={table.table_id} className="table-card compact">
                                    <div className="table-header">第 {table.table_id} 卓</div>
                                    <div className="seat-list-mini">
                                        {table.player_ids.map(pid => playerMap[pid].name).join(' / ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="footer-controls sticky">
                <button className="btn-primary" onClick={handleConfirm}>この卓組みで全回戦を確定・開始！</button>
            </div>
        </div>
    );
};
export default RoundPrepare;