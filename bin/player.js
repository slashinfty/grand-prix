import { writeFileSync } from 'node:fs';
import { AsciiTable3 as Table } from 'ascii-table3';
import chalk from 'chalk';
import rl from 'readline-sync';

import { autoSave, tournament } from './index.js';

export const player = {
    new: (name, value) => {
        try {
            const player = tournament.createPlayer(name);
            if (tournament.sorting !== 'none' && value > 0) player.values = { value: parseInt(value) };
            console.log(chalk.green(`${name} has been created`));
            if (autoSave) writeFileSync(tournament.meta.path, JSON.stringify(tournament, null, 4));
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    },
    remove: id => {
        const player = tournament.players.find(p => p.id === id || p.name === id);
        if (player === undefined) {
            console.log(chalk.redBright(`No player exists with name or ID of ${id}`));
        } else if (rl.keyInYNStrict(chalk.redBright(`Are you sure you want to remove ${player.name}?`))) {
            try {
                tournament.removePlayer(player.id);
                console.log(chalk.green(`Successfully removed ${player.name}`));
                if (autoSave) writeFileSync(tournament.meta.path, JSON.stringify(tournament, null, 4));
            } catch (err) {
                console.log(chalk.redBright(err));
            }
        }
    },
    list: active => {
        const table = new Table()
            .setHeading('ID', 'Name', 'Active')
            .setAlignCenter(3)
            .addRowMatrix(tournament.players.filter(player => active ? player.active : true).map(player => [player.id, player.name, player.active]));
        table.setStyle('reddit-markdown');
        console.log(table.toString());
    },
    standings: active => {
        const tiebreaks = tournament.scoring.tiebreaks.flatMap(tb => {
            if (tb === 'median buchholz') return 'medianBuchholz';
            if (tb === 'solkoff') return 'solkoff';
            if (tb === 'sonneborn berger') return 'sonnebornBerger';
            if (tb === 'cumulative') return ['cumulative', 'oppCumulative'];
            if (tb === 'game win percentage') return 'gameWinPct';
            if (tb === 'opponent game win percentage') return 'oppGameWinPct';
            if (tb === 'opponent match win percentage') return 'oppMatchWinPct';
            if (tb === 'opponent opponent match win percentage') return 'oppOppMatchWinPct';
        });
        const tiebreaksHeading = tiebreaks.map((_, i) => `TB#${i + 1}`);
        const table = new Table()
            .setHeading('Rank', 'Name', 'Points', ...tiebreaksHeading)
            .setAlignCenter(1)
            .setAlignCenter(3)
            .addRowMatrix(tournament.standings().filter(p => active ? p.player.active : true).map((p, i) => [i + 1, p.player.name, p.matchPoints, ...tiebreaks.map(tb => p.tiebreaks[tb])]));
        for (let i = 0; i < tiebreaks.length; i++) table.setAlignCenter(i + 4);
        table.setStyle('reddit-markdown');
        console.log(table.toString());
        console.log(tiebreaks.map((tb, i) => {
            let name =
            tb === 'medianBuchholz' ? 'Median Buchholz' :
            tb === 'solkoff' ? 'Solkoff' :
            tb === 'sonnebornBerger' ? 'Sonneborn-Berger' :
            tb === 'cumulative' ? 'Cumulative' :
            tb === 'oppCumulative' ? `Opponent's Cumulative` :
            tb === 'gameWinPct' ? 'Game Win Percentage' : 
            tb === 'oppGameWinPct' ? `Opponent's Game Win Percentage` :
            tb === 'oppMatchWinPct' ? `Opponent's Match Win Percentage` :
            `Opponent's Opponent's Match Win Percentage`;
            return `TB#${i + 1} - ${name}`;
        }).join('\n'));
    },
    details: id => {
        const player = tournament.standings().find(p => p.player.id === id || p.player.name === id);
        if (player === undefined) {
            console.log(chalk.redBright(`No player exists with name or ID of ${id}`));
        } else {
            console.log(JSON.stringify(player, null, 4));
        }
    }
}