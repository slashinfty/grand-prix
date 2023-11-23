/* Module imports */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';
import rl from 'readline-sync';

/* File imports */
import { autoSave, saveDir, manager, tournament, setTournament } from './index.js';

export const tour = {
    new: () => {
        const name = rl.question('Name of the tournament: ', { defaultInput: 'Tournament' });
        const stageOneFormats = ['Single elimination', 'Double elimination', 'Stepladder', 'Swiss', 'Round-Robin', 'Double Round-Robin'];
        const stageOneFormatIndex = rl.keyInSelect(stageOneFormats, 'Stage one format?', { cancel: false });
        const stageOneConsolation = stageOneFormatIndex > 0 ? false : rl.keyInYNStrict('Consolation match for third place?');
        const initialRound = rl.questionInt('Initial round number: ', { defaultInput: 1 });
        const maxRounds = stageOneFormats[stageOneFormatIndex] !== 'Swiss' ? 0 : rl.questionInt('Number of rounds (0 to be determined by number of players): ', { defaultInput: 0 });
        const maxPlayers = rl.questionInt('Maximum number of players (0 for no maximum): ', { defaultInput: 0 });
        const colored = stageOneFormats[stageOneFormatIndex] !== 'Swiss' ? false : rl.keyInYNStrict('Are players assigned colors?');
        const sortingOptions = ['Ascending', 'Descending', 'None'];
        const sortingOptionIndex = rl.keyInSelect(sortingOptions, 'Are players sorted by a value?', { cancel: false });
        const stageTwoFormats = ['Single elimination', 'Double elimination', 'Stepladder'];
        const stageTwoFormatIndex = stageOneFormatIndex < 3 ? -1 : rl.keyInSelect(stageTwoFormats, 'Stage two format?', { cancel: 'None' });
        let settings = {
            colored: colored,
            sorting: sortingOptions[sortingOptionIndex].toLowerCase(),
            stageOne: {
                consolation: stageOneConsolation,
                format: stageOneFormats[stageOneFormatIndex].replace(' ', '-').toLowerCase(),
                initialRound: initialRound,
                maxPlayers: maxPlayers,
                rounds: maxRounds
            },
            stageTwo: {
                format: stageTwoFormatIndex === -1 ? null : stageTwoFormats[stageTwoFormatIndex].replace(' ', '-').toLowerCase(),
                consolation: false,
                advance: {
                    value: 0,
                    method: 'all'
                }
            }
        };
        if (stageTwoFormatIndex > -1) {
            settings.stageTwo.consolation = stageTwoFormatIndex > 0 ? false : rl.keyInYNStrict('Consolation match for third place?');
            const advanceMethods = ['Points', 'Rank', 'All'];
            const advanceMethodIndex = rl.keyInSelect(advanceMethods, 'How to determine who makes stage two?', { cancel: false });
            settings.stageTwo.advance.method = advanceMethods[advanceMethodIndex].toLowerCase();
            settings.stageTwo.advance.value = advanceMethods[advanceMethodIndex] === 'All' ? 0 : rl.questionInt(advanceMethods[advanceMethodIndex] === 'Points' ? 'Minimum number of points to make stage two: ' : 'Lowest rank to make stage two: ', { defaultInput: 0 });
        }
        const winValue = rl.questionFloat('Number of points for a win: ', { defaultInput: 1 });
        const drawValue = rl.questionFloat('Number of points for a draw: ', { defaultInput: 0.5 });
        const lossValue = rl.questionFloat('Number of points for a loss: ', { defaultInput: 0 });
        const byeValue = rl.questionFloat('Number of points for a bye: ', { defaultInput: 1 });
        const bestOfValue = rl.questionInt('Maximum number of games in a match: ', { defaultInput: 1 });
        let tiebreakers = ['Median Buchholz', 'Solkoff', 'Sonneborn-Berger', 'Cumulative', 'Versus', 'Game win percentage', 'Opponent game win percentage', 'Opponent match win percentage', 'Opponent opponent match win percentage'];
        let chosenTiebreakers = [];
        if (stageOneFormatIndex > 2) {
            let response = 0;
            do {
                response = rl.keyInSelect(tiebreakers, `Pick tiebreaker #${10 - tiebreakers.length}`, { cancel: 'Selection complete' });
                if (response > -1) {
                    chosenTiebreakers.push(...tiebreakers.splice(response, 1));
                }
            } while (response > -1 && tiebreakers.length > 0);
        }
        settings = {
            ...settings,
            scoring: {
                bestOf: bestOfValue,
                win: winValue,
                draw: drawValue,
                loss: lossValue,
                bye: byeValue,
                tiebreaks: chosenTiebreakers.map(tiebreak => tiebreak.replace('-', ' ').toLowerCase())
            },
            meta: {
                path: resolve(saveDir, `${name}.json`)
            }
        }
        try {
            const newTournament = manager.createTournament(name, settings);
            setTournament(newTournament);
            writeFileSync(newTournament.meta.path, JSON.stringify(newTournament, null, 4));
            console.log(chalk.green('Tournament has been created'));
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    },
    load: path => {
        try {
            const data = readFileSync(path, 'utf8');
            const loadedTournament = manager.reloadTournament(JSON.parse(data));
            setTournament(loadedTournament);
            loadedTournament.settings = {
                meta: { path: path }
            };
            writeFileSync(path, JSON.stringify(loadedTournament, null, 4));
            console.log(chalk.green('Tournament has been loaded'));
        } catch (err) {
            console.log(chalk.redBright(err));
        }
    },
    start: () => {
        if (tournament === undefined) console.log(chalk.redBright('There is no active tournament. Use'), chalk.blueBright('tn'), chalk.redBright('to create a new tournament, or'), chalk.blueBright('tl'), chalk.redBright('to load a tournament'));
        else {
            try {
                tournament.start();
                console.log(chalk.green('Tournament has started'));
                if (autoSave) writeFileSync(tournament.meta.path, JSON.stringify(tournament, null, 4));
            } catch (err) {
                console.log(chalk.redBright(err));
            }
        }
    },
    next: () => {
        if (tournament === undefined) console.log(chalk.redBright('There is no active tournament. Use'), chalk.blueBright('tn'), chalk.redBright('to create a new tournament, or'), chalk.blueBright('tl'), chalk.redBright('to load a tournament'));
        else {
            try {
                tournament.next();
                console.log(chalk.green('Next round created'));
                if (autoSave) writeFileSync(tournament.meta.path, JSON.stringify(tournament, null, 4));
            } catch (err) {
                console.log(chalk.redBright(err));
            }
        }
    },
    details: () => {
        if (tournament === undefined) console.log(chalk.redBright('There is no active tournament. Use'), chalk.blueBright('tn'), chalk.redBright('to create a new tournament, or'), chalk.blueBright('tl'), chalk.redBright('to load a tournament'));
        else {
            let tournamentDetails = {...tournament};
            tournamentDetails.players = tournament.players.length;
            tournamentDetails.matches = tournament.matches.length;
            console.log(JSON.stringify(tournamentDetails, null, 4));
        }
    }
}