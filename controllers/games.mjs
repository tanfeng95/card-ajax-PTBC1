/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function initGamesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    const playerHand = [cardDeck.pop(), cardDeck.pop()];

    const newGame = {
      gameState: {
        cardDeck,
        playerHand,
      },
    };

    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // make changes to the object
      const playerHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];

      // update the game with the new info
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          playerHand,
        },

      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  const startGame = async (request, response) => {
    // console.log(request.body.user1);
    // console.log(request.body.user2);

    const cardDeck = shuffleCards(makeDeck());
    const playerHand = [cardDeck.pop(), cardDeck.pop()];

    const newGame = {
      gameState: {
        cardDeck,
        playerHand,
      },
    };
    // deal out a new shuffled deck for this game.
    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);

      const gameRecord1 = await game.addUser(request.body.user1);
      const gameRecord2 = await game.addUser(request.body.user2);
      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  const refresh = async (request, response) => {
    // get current game status  => how many win and loses and how many cards are left ?
    try {
      const gameStatus = await db.Game.findByPk(request.params.id);
      const winnerState = gameStatus.game_winner;
      const remainding = gameStatus.gameState.cardDeck.length;
      // console.log(remainding);
      response.send({
        remainingCards: remainding,
        winnerState,
      });
    } catch (ex) {
      console.log(ex);
    }
  };

  const CheckWinner = (p1Hand, p2Hand) => {
    if (p1Hand > p2Hand) {
      return 1; // player 1 win
    } if (p2Hand > p1Hand) {
      return 2; // player 2 wins
    }
    return 0; // it a draw
  };

  const winner = async (request, response) => {
    try {
      console.log(`p1 rank ${request.body.p1}`);
      console.log(`p2 rank ${request.body.p2}`);

      const game = await db.Game.findByPk(request.params.id);
      const result = CheckWinner(request.body.p1, request.body.p2);

      console.log(`result = ${result}`);
      console.log(`game winner${game.game_winner}`);
      let player1Score;
      let player2Score;
      if (game.game_winner === null) {
        player1Score = 0;
        player2Score = 0;
      } else {
        player1Score = game.game_winner.p1Wins;
        player2Score = game.game_winner.p2Wins;
      }

      console.log(`player1 ${player1Score}`);
      console.log(`player2 ${player2Score}`);

      if (result === 1) {
        player1Score += 1;
      }
      else if (result === 2)
      {
        player2Score += 1;
      }

      console.log(`player1 ${player1Score}`);
      console.log(`player2 ${player2Score}`);

      await game.update({
        game_winner: {
          p1Wins: player1Score,
          p2Wins: player2Score,
        },
      });

      response.send({
        id: game.id,
        gameWinner: result,
        p1Wins: game.game_winner.p1Wins,
        p2Wins: game.game_winner.p2Wins,
      });
    } catch (ex) {
      console.log(ex);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
    startGame,
    refresh,
    winner,
  };
}
