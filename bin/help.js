import chalk from 'chalk';

export const help = {
    general: () => {
        console.log(chalk.yellowBright(`
Grand Prix - Help

= Commands for Tournaments =

tn
Create a new tournament

tl (file name)
Load an existing tournament
Must be located in the save directory

ts
Start a tournament

tx
Start the next round of a tournament

t?
Get the current settings of the tournament

= Commands for Players =

pn (name) [value]
Add a new player to the tournament
Value is optional and only necessary if players are sorted

pr (id)
Remove a player from the tournament
ID can be player ID or player name

pl [active]
Get a list of players in a table
Use "pl active" to get only active players

ps [active]
Get the standings in a table
Use "ps active" to get only active players

p? (id)
Get the current details of a player
ID can be player ID or player name

= Commands for Matches =

m (r#m# || #) (p1-p2[-d] || clear)
Report the result of a match
To identify the match, use "r#m#" with round and match number, or just the match number for the current round
To enter the result, use "p1-p2" for number of wins for each player, and add draws if necessary
Passing "clear" as the result will clear results

ml [round] [active]
Get a list of matches in a table
Round number can be included to see a specific round instead of the current round
Passing "active" will get only active matches in the round

m? (r#m#)
Get the current details of a match

= Other Commands =

s
Save the current tournament

sb [identifier]
Backup the current tournament
File is saved in the save directory with the identifier specified appended to the file name
If no identifier is supplied, the date and time is appended to the file name

sa
Change whether or not the tournament is automatically saved after each action

sl (directory)
Change the directory where tournaments are saved to and loaded from

q
Quit the application
`));
    }
}