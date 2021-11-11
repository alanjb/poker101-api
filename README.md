# Poker101 API Documentation 

## Technologies 
typescript
node
express
mongodb
mongoose
npm 
jest

## To run the server
Run `npm run start` in root directory. The server will use http://localhost:8000/ 

## API Services 

### Game - /api/game
- createGame()
- bet()
- discard()
- check()
- fold()

### Profile - /api/profile
- createUser()
- getUser()
- getUsers()

Endpoint | Method | Description 
/api/profile/create | POST | Creates a new user 
/api/profile/getUser | GET | Returns an existing user
/api/profile/getUsers | GET | Returns an array of existing user
## Entity Diagram
![SWE681-DB](https://user-images.githubusercontent.com/38384272/138622944-6cc308ba-a312-4758-bbc5-36dd02095816.png)
