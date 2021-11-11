# Poker101 API Documentation 

## Game Description 
Poker101 allows users to play 5 Draw Poker
- Users can create a profile by signing up, 
- Sign in once the profile is created 
- Create games and invite players
- Join existing game
- 2 rounds
- Player who creates game is dealer
- First player who joins the game who is not the dealer is Player 2 and has the first move each round
- Discard allowed after first round finishes
- If players have equally ranked hands, pot is split
- Ace can be used for highest or lowest card in a straight
- If all players check in the first round of  betting, the deal moves to the next player and another ante is added by each player
- If a player leaves, there must be a timeout where eventually they will forfeit

## Technologies 
typescript
node
express
mongodb
mongoose
npm 
jest

## To run the server
Run `npm run start` in root directory. The server will use http://localhost:8000/.

## API Methods 

### Game - /api/game
- createGame()
- check()
- bet()
- call()
- raise()
- discard()
- fold()
- gameComplete()

### Profile - /api/profile
- createUser()
- getUser()
- getUsers()

Endpoint | Method | Description 
--- | --- | ---
/api/profile/createUser | POST | Creates a new user 
/api/profile/getUser | GET | Returns an existing user
/api/profile/getUsers | GET | Returns an array of existing users
/api/game/createGame | POST | Creates a new game 
/api/game/check | POST | Player defers betting option. If at a later point a player bet, any player that has checked must then call, raise or fold
/api/game/bet | POST | Player can add an amount to a pot
/api/game/call | POST | Player adds the amount to the pot that the player before them bet. This is one of two possible responses to a bet
/api/game/raise | POST | Player adds the amount to the pot that the player before them bet plus an additional amount. This is one of two possible responses to a bet
/api/game/discard | POST | Player can discard no more than 3 cards after first round of betting
/api/game/fold | POST | Player exists the game
/api/game/gameComplete | POST | Records the outcome and statistics of the game


## Entity Diagram
![SWE681-DB](https://user-images.githubusercontent.com/38384272/138622944-6cc308ba-a312-4758-bbc5-36dd02095816.png)