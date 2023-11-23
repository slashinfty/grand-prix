import { writeFileSync } from 'node:fs';
import { AsciiTable3 as Table } from 'ascii-table3';
import chalk from 'chalk';

import { autoSave, tournament } from './index.js';

export const match = {
    report: (id, result) => {
        let match;
        if (/^\d+$/.test(id)) match = tournament.matches.find(m => m.round === tournament.round && m.match === parseInt(id));
        else if (/^r\d+m\d+$/.test(id)) {
            const [roundNumber, matchNumber] = id.match(/\d+/g);
            match = tournament.matches.find(m => m.round === parseInt(roundNumber) && m.match === parseInt(matchNumber));
        } else {
            console.log(chalk.redBright('Input must either be a match number or round and match number (r#m#)'));
            return;
        }
        if (match === undefined) {
            console.log(chalk.redBright('No match exists with that match number'));
            return;
        }
        if (result === 'clear') {
            try {
                tournament.clearResult(match.id);
                console.log(chalk.green('Result cleared'));
                if (autoSave) writeFileSync(tournament.meta.path, JSON.stringify(tournament, null, 4));
            } catch (err) {
                console.log(chalk.redBright(err));
            }
            return;
        }
        let [win, loss, draw] = result.split('-');
        if (isNaN(Number(win)) || isNaN(Number(loss)) || (draw !== undefined && isNaN(Number(draw)))) {
            console.log(chalk.redBright('Results must be entered as W-L or W-L-D (relative to player 1)'));
            return;
        }
        try {
            tournament.enterResult(match.id, Number(win), Number(loss), Number(draw || 0));
            console.log(chalk.green('Result recorded'));
            if (autoSave) writeFileSync(tournament.meta.path, JSON.stringify(tournament, null, 4));
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    },
    list: (round, active) => {
        const table = new Table(`Round ${round}`)
            .setHeading('Match', 'Player 1', 'Player 2', 'Result', 'Active')
            .setAlignCenter(1)
            .setAlignCenter(4)
            .setAlignCenter(5)
            .addRowMatrix(tournament.matches.filter(match => match.round === round && (active ? match.active : true)).map(match => [
                match.match,
                match.player1.id === null ? 'Bye' : tournament.players.find(p => p.id === match.player1.id).name,
                match.player2.id === null ? 'Bye' : tournament.players.find(p => p.id === match.player2.id).name,
                `${match.player1.win}-${match.player2.win}${match.player1.draw > 0 ? `-${match.player1.draw}` : ''}`,
                match.active]));
        table.setStyle('reddit-markdown');
        console.log(table.toString());
    },
    details: id => {
        let match;
        if (/^\d+$/.test(id)) match = tournament.matches.find(m => m.round === tournament.round && m.match === parseInt(id));
        else if (/^r\d+m\d+$/.test(id)) {
            const [roundNumber, matchNumber] = id.match(/\d+/g);
            match = tournament.matches.find(m => m.round === parseInt(roundNumber) && m.match === parseInt(matchNumber));
        } else {
            console.log(chalk.redBright('Input must either be a match number or round and match number (r#m#)'));
            return;
        }
        if (match === undefined) {
            console.log(chalk.redBright('No match exists with that match number'));
        } else {
            console.log(JSON.stringify(match, null, 4));
        }
    }
}