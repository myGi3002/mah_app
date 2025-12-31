// src/pages/Launcher.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/StorageService';
import FloatingLabelSelect from '../components/FloatingLabelSelect';

const Launcher = () => {
    const [tournaments, setTournaments] = useState([]);
    const [name, setName] = useState('');
    const [maxTables, setMaxTables] = useState(1);
    const [maxGames, setMaxGames] = useState('フリー');
    const [mode, setMode] = useState('normal');
    const navigate = useNavigate();

    useEffect(() => {
        // localStorage から大会一覧を取得
        setTournaments(StorageService.listTournaments());
    }, []);

    const handleCreate = (e) => {
        e.preventDefault();
        try {
            // ストレージに新規保存
            const filename = StorageService.createTournament(name, Number(maxTables), maxGames, mode);
            navigate(`/t/${filename}/dashboard`);
        } catch (err) {
            alert("大会の作成に失敗しました。");
        }
    };

    return (
        <div className="launcher-page">
            <h1 className="page-title">大会を開く</h1>
            <div className="card">
                <form onSubmit={handleCreate}>
                    <div className="input-group">
                        <label className="simple-label">大会名</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例: test01" required />
                    </div>
                    <div className="input-group">
                        <label className="simple-label">使用卓数</label>
                        <input type="number" value={maxTables} onChange={e => setMaxTables(e.target.value)} min="1" />
                    </div>
                    <FloatingLabelSelect 
                        label="対局数設定" name="max_games" value={maxGames} 
                        onChange={e => setMaxGames(e.target.value)}
                        options={[{label:'フリー', value:'フリー'}, {label:'1戦', value:'1'}, {label:'2戦', value:'2'}, {label:'3戦', value:'3'}, {label:'4戦', value:'4'}]}
                    />
                    <FloatingLabelSelect 
                        label="モード選択" name="mode" value={mode} 
                        onChange={e => setMode(e.target.value)}
                        options={[{label:'通常モード', value:'normal'}, {label:'紅白戦モード', value:'kouhaku'}]}
                    />
                    <button type="submit" className="btn-primary">新しい大会を開始！</button>
                </form>
            </div>

            {tournaments.length > 0 && (
                <>
                    <h3 className="sub-title">過去の大会</h3>
                    <div className="card">
                        {tournaments.map(f => (
                            <button key={f} className="btn-history" onClick={() => navigate(`/t/${f}/dashboard`)}>
                                {f}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
export default Launcher;