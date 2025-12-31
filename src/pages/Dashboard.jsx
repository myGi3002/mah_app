// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/StorageService';

const Dashboard = () => {
    const { filename } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [newName, setNewName] = useState('');

    const loadData = () => {
        const tournamentData = StorageService.getTournament(filename);
        setData(tournamentData);
    };

    useEffect(() => {
        setData(null);
        loadData();
    }, [filename]);

    const handleRegister = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        const updated = StorageService.addPlayer(filename, newName);
        setData({...updated});
        setNewName('');
    };

    const handleToggleTeam = (playerId) => {
        const updated = StorageService.togglePlayerTeam(filename, playerId);
        setData({...updated});
    };

    const handleShuffle = () => {
        const updated = StorageService.shuffleTeams(filename);
        setData({...updated});
    };

    if (!data) return <div className="container"><h3>読み込み中...</h3></div>;

    const roundCount = data.rounds.length;

    return (
        <div className="dashboard">
            <h1 className="tournament-title">{data.tournament_info.name}</h1>
            
            {/* 1. 進行状況・スコア入力ショートカット (新設) */}
            {data.rounds.length > 0 && (
                <div className="card">
                    <h2>対局進行 / スコア入力</h2>
                    <p className="hint-text">卓番号をタップして点数を入力してください</p>
                    <div className="round-progress-grid">
                        {data.rounds.map(round => (
                            <div key={round.round_number} className="round-progress-block">
                                <Link to={`/t/${filename}/round/${round.round_number}`} className="round-link-title">
                                    第 {round.round_number} 回戦 ❯
                                </Link>
                                <div className="dashboard-table-btns">
                                    {round.tables.map(table => (
                                        <Link 
                                            key={table.table_id} 
                                            to={`/t/${filename}/round/${round.round_number}/table/${table.table_id}`}
                                            className={`dash-table-btn ${table.is_recorded ? 'recorded' : ''}`}
                                        >
                                            {table.table_id}卓 {table.is_recorded ? '✅' : '📝'}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="card">
                <h2>参加者登録</h2>
                {(data.tournament_info.max_games === 'フリー' || roundCount === 0) ? (
                    <form onSubmit={handleRegister} className="inline-form">
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="名前" required />
                        <button type="submit" className="btn-primary add-btn">追加</button>
                    </form>
                ) : <p className="lock-msg">※対局開始後は追加できません</p>}
            </div>

            <div className="card">
                <h2>現在のランキング</h2>
                {data.tournament_info.mode === 'kouhaku' && (
                    <div className="team-status-bar">
                        <span className="team-score red">紅: {data.players.filter(p=>p.team==='red').reduce((a,b)=>a+(b.total_score??0),0).toFixed(1)}</span>
                        <button onClick={handleShuffle} className="btn-shuffle">チームをシャッフル</button>
                        <span className="team-score white">白: {data.players.filter(p=>p.team==='white').reduce((a,b)=>a+(b.total_score??0),0).toFixed(1)}</span>
                    </div>
                )}
                <table className="ranking-table">
                    <thead><tr><th>位</th><th>名前</th><th>得点</th>{data.tournament_info.mode === 'kouhaku' && <th>組</th>}</tr></thead>
                    <tbody>
                        {[...data.players].sort((a,b)=>(b.total_score??0)-(a.total_score??0)).map((p, i) => (
                            <tr key={p.id}>
                                <td>{i+1}</td><td>{p.name}</td><td>{(p.total_score??0).toFixed(1)}</td>
                                {data.tournament_info.mode === 'kouhaku' && (
                                    <td>
                                        <button className={`team-badge ${p.team}`} onClick={() => handleToggleTeam(p.id)}>
                                            {p.team==='red'?'紅':'白'}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="footer-controls">
                {roundCount === 0 && (
                    <button className="btn-primary" onClick={() => navigate(`/t/${filename}/round/prepare`)}>
                        卓組みを一括生成する
                    </button>
                )}
                <div className="action-row">
                    <button className="btn-secondary" onClick={() => StorageService.exportJSON(filename)}>JSON出力</button>
                    <Link to="/" className="btn-secondary">大会一覧へ</Link>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;