#!/usr/bin/env node

/* Module imports */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import figlet from 'figlet';
import rl from 'readline-sync';
import TO from 'tournament-organizer';

/* File imports */
import { help } from './help.js';
import { match } from './match.js';
import { player } from './player.js';
import { tour } from './tournament.js';

/* tournament-organizer setup */
const manager = new TO();
let tournament = undefined;
const setTournament = t => tournament = t;
export { manager, tournament, setTournament };

/* Configuration setup */
const configPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'config.json');
if (!existsSync(configPath)) {
    const initialSettings = {
        saveDir: resolve(dirname(fileURLToPath(import.meta.url)), '..', 'tournaments'),
        autoSave: false
    }
    writeFileSync(configPath, JSON.stringify(initialSettings, null, 4));
}
const configData = readFileSync(configPath, 'utf8');
const config = JSON.parse(configData);
let saveDir = config.saveDir;
if (!existsSync(saveDir)) mkdirSync(saveDir);
const setSaveDir = dir => saveDir = dir;
let autoSave = config.autoSave;
export { autoSave, saveDir, setSaveDir };

/* Start here */
console.log(chalk.green(figlet.textSync(`Grand Prix`,{ font: "Graffiti" })));
console.log(chalk.green('Version 0.1.0\n'));
/* Accepting input */
const ask = () => {
    let answer = rl.question('> ');
    const words = answer.split(` `);
    const type = words.shift();
    if (/^t[lnsx\?]$/.test(type)) {
        if (/^tn$/.test(type)) tour.new();
        if (/^tl$/.test(type) && typeof words[0] === 'string') tour.load(resolve(saveDir, words[0] + (extname(words[0]) === '' ? '.json' : '')));
        if (/^ts$/.test(type)) tour.start();
        if (/^tx$/.test(type)) tour.next();
        if (/^t\?$/.test(type)) tour.details();
    } else if (/^p[lnrs\?]$/.test(type) && tournament !== undefined) {
        if (/^pn$/.test(type)) player.new(words[0], words[1] || 0);
        if (/^pr$/.test(type)) player.remove(words[0]);
        if (/^pl$/.test(type)) player.list(words[0] === 'active');
        if (/^ps$/.test(type)) player.standings(words[0] === 'active');
        if (/^p\?$/.test(type)) player.details(words[0]);
    } else if (/^m[l\?]?$/.test(type) && tournament !== undefined) {
        if (/^m$/.test(type) && words[0] !== undefined && words[1] !== undefined) match.report(words[0], words[1]);
        if (/^ml$/.test(type)) {
            if (words.length === 0) match.list(tournament.round, false);
            else if (isNaN(Number(words[0]))) match.list(tournament.round, words[0] === 'active');
            else match.list(parseInt(words[0]) || tournament.round, words[1] === 'active');
        }
        if (/^m\?$/.test(type)) match.details(words[0]);
    } else if (/^s[abl]?$/.test(type)) {
        if (/^sa$/.test(type)) {
            autoSave = rl.keyInYNStrict('Turn on auto save?');
            console.log(`Auto save is now ${autoSave ? 'on' : 'off'}`);
        }
        if (/^sl$/.test(type) && words[0] !== undefined) {
            if (existsSync(words[0])) {
                saveDir = words[0];
                console.log(chalk.greenBright(`Save directory updated to ${saveDir}`));
            } else {
                console.log(chalk.redBright(`${words[0]} does not exist`));
            }
        }
        if (/^sb$/.test(type) && tournament !== undefined) {
            if (words[0] === undefined) {
                const now = new Date(Date.now());
                writeFileSync(resolve(saveDir, `${tournament.name}-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${now.getHours()}${now.getMinutes()}.json`), JSON.stringify(tournament, null, 4));
            } else {
                writeFileSync(resolve(saveDir, `${tournament.name}-${words[0]}.json`, JSON.stringify(tournament, null, 4)));
            }
            console.log(chalk.greenBright('Tournament backed up'));
        }
        if (/^s$/.test(type) && tournament !== undefined) {
            writeFileSync(tournament.meta.path, JSON.stringify(tournament, null, 4));
            console.log(chalk.greenBright('Tournament saved'));
        }
        if (/^s[al]$/.test(type)) writeFileSync(configPath, JSON.stringify({
            saveDir: saveDir,
            autoSave: autoSave
        }, null, 4));
    } else if (/^(q|quit)$/.test(type)) {
        if (rl.keyInYNStrict(chalk.redBright('Do you want to quit?'))) process.exit(1);
        else ask();
    } else if (/^help$/.test(type)) {
        help.general();
    } else {
        console.log(chalk.redBright('That is not a valid command\nType'), chalk.blueBright('help'), chalk.redBright('if you need help'));
    }
    ask();
}

ask();