// src/services/StorageService.js
import { runRecalculation } from '../logic/calc';

const PREFIX = "mah_tournament_";

export const StorageService = {
    listTournaments: () => Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).map(k => k.replace(PREFIX, "")),
    
    getTournament: (name) => JSON.parse(localStorage.getItem(PREFIX + name)),

    saveTournament: (name, data) => {
        const updated = runRecalculation(data);
        localStorage.setItem(PREFIX + name, JSON.stringify(updated));
        return updated;
    },
    // 生成された全回戦を一括確定させる
    saveAllRounds: (name, newRounds) => {
        if (!newRounds || !Array.isArray(newRounds)) {
            console.error("保存しようとした卓組み案が不正です:", newRounds);
            return null;
        }
        const data = StorageService.getTournament(name);
        if (!data) return null;

        const startNum = data.rounds.length;
        const adjustedRounds = newRounds.map((r, i) => ({
            ...r,
            round_number: startNum + i + 1
        }));
        
        data.rounds = [...data.rounds, ...adjustedRounds];
        return StorageService.saveTournament(name, data);
    },
    createTournament: (name, maxTables, maxGames, mode) => {
       const data = {
            tournament_info: {
                name, max_tables: maxTables, max_games: maxGames, mode,
                settings: {
                    uma_type: "10-30",
                    start_pts: 250,
                    return_pts: 300,
                    shizumi_uma: {
                        "1": [12, -1, -3, -8], // 1人浮きパターン
                        "2": [8, 4, -4, -8],  // 2人浮きパターン
                        "3": [8, 3, 1, -12]   // 3人浮きパターン
                    }
                }
            },
            players: [], rounds: []
        };
        localStorage.setItem(PREFIX + name, JSON.stringify(data));
        return name;
    },

    addPlayer: (name, playerName) => {
        const data = StorageService.getTournament(name);
        const newId = data.players.length > 0 ? Math.max(...data.players.map(p => p.id)) + 1 : 1;
        data.players.push({ id: newId, name: playerName, total_score: 0, team: "white", games_played: 0 });
        return StorageService.saveTournament(name, data);
    },

    // ★ チームの手動切り替え機能を追加
    togglePlayerTeam: (name, playerId) => {
        const raw = localStorage.getItem(PREFIX + name);
        if (!raw) return null;
        const data = JSON.parse(raw); // 完全に新しいオブジェクトとして読み込む

        // 指定したIDのプレイヤーだけを確実に更新
        data.players = data.players.map(p => {
            if (p.id === playerId) {
                return { ...p, team: p.team === "red" ? "white" : "red" };
            }
            return p;
        });

        return StorageService.saveTournament(name, data);
    },

    // ★ エラーの出ていたシャッフル機能
    shuffleTeams: (name) => {
        const raw = localStorage.getItem(PREFIX + name);
        if (!raw) return null;
        const data = JSON.parse(raw);

        const teams = ["red", "white"];
        const shuffled = [...data.players].sort(() => Math.random() - 0.5);
        
        data.players = data.players.map(p => {
            const index = shuffled.findIndex(s => s.id === p.id);
            return { ...p, team: index % 2 === 0 ? "red" : "white" };
        });

        return StorageService.saveTournament(name, data);
    },

    // ★ 対局開始（ラウンド確定）処理
    startRound: (name, tables, restingPlayerIds) => {
        const data = StorageService.getTournament(name);
        const newRound = {
            round_number: data.rounds.length + 1,
            tables: tables,
            resting_player_ids: restingPlayerIds
        };
        data.rounds.push(newRound);
        StorageService.saveTournament(name, data);
        return newRound.round_number;
    },

    // ★ スコア送信
    submitScore: (name, roundNum, tableId, rawScores) => {
        const data = StorageService.getTournament(name);
        const round = data.rounds[roundNum - 1];
        const table = round.tables.find(t => t.table_id === tableId);
        table.scores = rawScores;
        table.is_recorded = true;
        return StorageService.saveTournament(name, data);
    },

    // ★ 設定更新
    updateSettings: (name, newSettings) => {
        const data = StorageService.getTournament(name);
        data.tournament_info.settings = newSettings;
        return StorageService.saveTournament(name, data);
    },

    exportJSON: (name) => {
        const data = localStorage.getItem(PREFIX + name);
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.json`;
        a.click();
    }
};