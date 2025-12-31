
export const generateOptimizedMultiRounds = (players, maxTables, totalRounds) => {
    let bestRounds = [];
    let minPenalty = Infinity;

    // 数値でない場合はデフォルト値を設定
    const tGames = Number(targetGames) || 1;
    const mTables = Number(maxTables) || 1;

    if (!players || players.length < 4) return [];

    for (let i = 0; i < 1000; i++) {
        try {
            const { rounds, totalPenalty } = simulateTournament(players, mTables, tGames);
            // totalPenalty が正しく計算されている場合のみ比較
            if (!isNaN(totalPenalty) && totalPenalty < minPenalty) {
                minPenalty = totalPenalty;
                bestRounds = rounds;
            }
        } catch (e) {
            console.error("シミュレーション中にエラー:", e);
        }
    }
    
    // 1000回試行しても案が空なら、最低限の1回分を返す等の処理
    return bestRounds.length > 0 ? bestRounds : [];
};

const simulateTournament = (players, maxTables, targetGames) => {
    const rounds = [];
    const playerStats = {};
    players.forEach(p => {
        playerStats[p.id] = { opponents: [], seats: [0,0,0,0], gamesPlayed: 0 };
    });

    let totalPenalty = 0;
    let roundNum = 1;
    let seatPool = [];
    
    // 全員の対局枠をプールに用意
    players.forEach(p => {
        for (let g = 0; g < targetGames; g++) seatPool.push(p.id);
    });
    seatPool.sort(() => Math.random() - 0.5);

    let currentSeatIdx = 0;
    while (currentSeatIdx < seatPool.length) {
        const roundTables = [];
        const usedInThisRound = new Set();
        
        // 残り人数からこのラウンドの卓数を決定
        const remaining = seatPool.length - currentSeatIdx;
        const tablesCount = Math.min(maxTables, Math.floor(remaining / 4));
        
        if (tablesCount === 0) break; 

        for (let t = 0; t < tablesCount; t++) {
            const members = seatPool.slice(currentSeatIdx, currentSeatIdx + 4);
            currentSeatIdx += 4;

            members.forEach((pid, seatIdx) => {
                if (usedInThisRound.has(pid)) totalPenalty += 100000; // 同一回戦重複
                usedInThisRound.add(pid);

                const stats = playerStats[pid];
                const others = members.filter(id => id !== pid);
                others.forEach(oid => {
                    if (stats.opponents.includes(oid)) totalPenalty += 100;
                    stats.opponents.push(oid);
                });
                stats.seats[seatIdx]++;
                const bias = Math.max(...stats.seats) - Math.min(...stats.seats);
                totalPenalty += bias * 50;
            });

            roundTables.push({
                table_id: t + 1, player_ids: members,
                scores: [0,0,0,0], points: [0,0,0,0], is_recorded: false
            });
        }
        rounds.push({ round_number: roundNum++, tables: roundTables, resting_player_ids: [] });
        if (roundNum > 100) break; // 安全装置
    }
    return { rounds, totalPenalty };
};