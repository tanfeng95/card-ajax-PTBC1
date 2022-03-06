let currentGame = null;
const gameContainer = document.querySelector('#game-container');

const loginDiv = document.createElement('div');
loginDiv.setAttribute('id', 'loginDiv');

const btnDiv = document.createElement('div');
btnDiv.setAttribute('id', 'btnDiv');

const dealListDiv = document.createElement('div');
dealListDiv.setAttribute('id', 'dealListDiv');

const refreshDiv = document.createElement('div');
refreshDiv.setAttribute('id', 'refreshDiv');

gameContainer.append(loginDiv, btnDiv, dealListDiv, refreshDiv);

// login screen
const pUsername = document.createElement('p');
pUsername.innerHTML = 'username : ';
const inputUsername = document.createElement('input');
inputUsername.setAttribute('type', 'text');

const pPassword = document.createElement('p');
pPassword.innerHTML = 'password : ';
const inputPassword = document.createElement('input');
inputPassword.setAttribute('type', 'text');

const btnLogin = document.createElement('button');
btnLogin.innerHTML = 'sign in';
btnLogin.addEventListener('click', () => { login(); });

const pWrongInput = document.createElement('p');

loginDiv.append(pUsername, inputUsername, pPassword, inputPassword, btnLogin, pWrongInput);
const startGameBtn = document.createElement('button');

let user1Id;
let user12Id;
const login = () => {
  const data = {
    username: inputUsername.value,
    password: inputPassword.value,
  };
  axios
    .post('/users/signin', data)
    .then((response) => {
      console.log(response);
      const { data } = response;
      if (data === false) {
        pWrongInput.innerHTML = 'wrong email or password';
      } else {
        // console.log(data.getUser[0].id);
        user1Id = data.getUser[0].id;
        loginDiv.style.display = 'none';
        // create a start game button

        startGameBtn.innerHTML = 'start game';
        startGameBtn.addEventListener('click', () => { startGame(); });
        btnDiv.appendChild(startGameBtn);
      }
    });
};

// create a start game button
// const startGameBtn = document.createElement('button');
// startGameBtn.innerHTML = 'start game';
// startGameBtn.addEventListener('click', () => { startGame(); });
// btnDiv.appendChild(startGameBtn);

const startGame = async () => {
  let allUser;
  await axios
    .get('/users/findall')
    .then((response) => {
      const { data } = response;
      // console.log();
      allUser = data.findAll;
    });
  console.log(allUser);
  const { length } = allUser;
  const randomUser = Math.floor(Math.random() * length);
  console.log(randomUser);
  const userData = { user1: user1Id, user2: randomUser + 1 };
  axios
    .post('/startGame', userData)
    .then((response) => {
      console.log(response);
      startGameBtn.style.display = 'none';
      currentGame = response.data;

      const dealBtn = document.createElement('button');
      dealBtn.addEventListener('click', dealCards);
      dealBtn.innerText = 'Deal';
      btnDiv.appendChild(dealBtn);

      const refreshBtn = document.createElement('button');
      refreshBtn.addEventListener('click', refreshCards);
      refreshBtn.innerText = 'refresh';
      btnDiv.appendChild(refreshBtn);

      const DealListHeader = document.createElement('h3');
      DealListHeader.innerHTML = 'Deal list';
      dealListDiv.appendChild(DealListHeader);

      const winnerDiv = document.createElement('div');
      winnerDiv.setAttribute('id', 'winnerDiv');
      dealListDiv.appendChild(winnerDiv);

      const singleDealDiv = document.createElement('div');
      singleDealDiv.setAttribute('id', 'singleDealDiv');
      singleDealDiv.style.display = 'flex';
      dealListDiv.appendChild(singleDealDiv);

      const p1Card = document.createElement('div');
      p1Card.setAttribute('id', 'p1Card');
      singleDealDiv.appendChild(p1Card);

      const p2Card = document.createElement('div');
      p2Card.setAttribute('id', 'p2Card');
      singleDealDiv.appendChild(p2Card);

      console.log(currentGame);

      runGame(currentGame);
    })
    .catch((ex) => {
      console.log(ex);
    });
};

// // global value that holds info about the current hand.
// let currentGame = null;

// // get game container
//

const whoTheWinnerString = (p1Hand, p2Hand) => {
  try {
    if (p1Hand > p2Hand) {
      return 'player 1 wins';
    } if (p2Hand > p1Hand) {
      return 'player 2 wins ';
    }
    return 'it a draw';
  } catch (ex) {
    console.log(ex);
  }
};

const CheckWinner = async (p1Hand, p2Hand) => {
  const winnerString = whoTheWinnerString(p1Hand, p2Hand);
  const data2 = { p1: p1Hand, p2: p2Hand };

  let returnData;
  try {
    await axios.put(`/games/${currentGame.id}/winner`, data2)
      .then((response) => {
        const { data } = response;
        data.winnerString = winnerString;
        returnData = data;
        console.log(data);
      });
    return returnData;
  } catch (ex) {
    console.log(ex);
  }
};

// // 3
// // DOM manipulation function that displays the player's current hand.
const runGame = async ({ playerHand }) => {
  // manipulate DOM
  const getDiv1 = document.getElementById('p1Card');
  const getDiv2 = document.getElementById('p2Card');
  const getWinnerDiv = document.getElementById('winnerDiv');

  const winnerData = await CheckWinner(playerHand[0].rank, playerHand[1].rank);
  console.log(winnerData);
  getWinnerDiv.innerHTML = `${winnerData.winnerString}`;

  getDiv1.innerText = `
    Player 1 Hand:
    ${playerHand[0].name}
    of
    ${playerHand[0].suit}

  `;
  getDiv2.innerText = `  
    Player 2 Hand:
    ${playerHand[1].name}
    of
    ${playerHand[1].suit}`;
  refreshCards();
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const refreshCards = () => {
  console.log('refresh');
  axios.get(`/games/${currentGame.id}/refresh`)
    .then((response) => {
      console.log(response);
      const { data } = response;
      console.log(data.remainingCards);
      console.log(data.winnerState);
      refreshDiv.innerHTML = `card status => remaining cards = ${data.remainingCards}
       </br>  p1 win rate : ${data.winnerState.p1Wins} p2 win rate : ${data.winnerState.p2Wins}`;
    });
};

// // 2
// const createGame = function () {
//   // Make a request to create a new game
//   axios.post('/games')
//     .then((response) => {
//       // set the global value to the new game.
//       currentGame = response.data;

//       console.log(currentGame);

//       // display it out to the user
//       runGame(currentGame);

//       // for this current game, create a button that will allow the user to
//       // manipulate the deck that is on the DB.
//       // Create a button for it.
//       const dealBtn = document.createElement('button');
//       dealBtn.addEventListener('click', dealCards);

//       // display the button
//       dealBtn.innerText = 'Deal';
//       document.body.appendChild(dealBtn);
//     })
//     .catch((error) => {
//       // handle error
//       console.log(error);
//     });
// };

// // // manipulate DOM, set up create game button
// // createGameBtn.addEventListener('click', createGame);
// // createGameBtn.innerText = 'Create Game';
// // document.body.appendChild(createGameBtn);

// // 1
// const createGameBtn = document.createElement('button');
// createGameBtn.addEventListener('click', createGame);
// createGameBtn.innerText = 'Create Game';
// gameContainer.appendChild(createGameBtn);

// const buttonsDivs = document.createElement('div');
// const dealButton = document.createElement('Button');
// dealButton.innerHTML = 'deal';
// const refreshButton = document.createElement('refresh');
// refreshButton.innerHTML = 'refresh';
