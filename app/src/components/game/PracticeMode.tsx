/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PracticeMode.tsx                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: codespace <codespace@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/12/06 10:58:41 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/09 17:34:41 by codespace        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Sketch from "react-p5";
import p5Types from "p5";
import "p5/lib/addons/p5.sound";
import CryptoJS from 'crypto-js';
import GameResults from "./GameResults";
import { useEffect, useState } from "react";
import { socket_game } from "../../utils/client-socket";

class Results {
  username: string;
  userA:    string;
  userB:    string;
  score1:   number;
  score2:   number;
  begin:    number;
  end:      number;
  constructor(user:string, p1:string, p2:string, p1_score:number, p2_score:number, begin:number, end:number) {
    this.username = user;
    this.userA = p1;
    this.userB = p2;
    this.score1 = p1_score;
    this.score2 = p2_score;
    this.begin = begin;
    this.end = end;
  };
}

class Ball {
  x:     number;
  y:     number;
  d:     number;
  hit:   number;
  velox: number;
  veloy: number;
  begin: number;
  end:   number;
  constructor(cvw: number, cvh: number) {
    this.x = cvw / 2;
    this.y = cvh / 2;
    this.d = cvh / 30;
    this.hit = 0;
    this.velox = 0;
    this.veloy = 1;
    this.begin= 0;
    this.end= 0;
  }
}

class Paddle {
  user:  string;
  x:     number;
  y:     number;
  w:     number;
  h:     number;
  score: number;
  speed: number;
  constructor(user:string, x: number, y: number, cvw: number, cvh: number) {
    this.user = user;
    this.x = x;
    this.y = y;
    this.w = cvw / 50;
    this.h = cvh / 4;
    this.score = 0;
    this.speed = 5;
  }
}

//variables
let lvl = 0.1;
let win = 5;
let cvw = window.innerWidth * 0.8;
let cvh = cvw * 0.7;
while (cvh > window.innerHeight - 55) {
  cvw--;
  cvh = cvw * 0.7;
}
let ball = new Ball(cvw, cvh);
let bot = new Paddle('Pongo bot',cvw / 120, cvh / 2, cvw, cvh);
let user = new Paddle('You', cvw - cvw / 120, cvh / 2, cvw, cvh);
let bounceSound:p5Types.SoundFile;

// data handling
const secretKey = 'PongoChicken789';

export const encryptData = (data: string) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decryptData = (encryptedData: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

function saveGameData(){
  const gameData = {ball, bot, user};
  localStorage.setItem('gameData', encryptData(JSON.stringify(gameData)));
  loadGameData();
}

function loadGameData(){
  const savedGameData = localStorage.getItem('gameData');
    if (savedGameData) {
      const savedData = JSON.parse(decryptData(savedGameData));
      ball = savedData.ball;
      bot = savedData.bot;
      user = savedData.user;
      updateDimensions();
    }
}

function updateDimensions() {
  user.y /= cvw;
  bot.y /= cvw;
  ball.y /= cvw;
  ball.x /= cvw;
  cvw = window.innerWidth * 0.8;
  cvh = cvw * 0.7;
  while (cvh > window.innerHeight - 55) {
    cvw--;
    cvh = cvw * 0.7;
  }
  ball.y *= cvw;
  ball.x *= cvw;
  ball.d = cvh / 30;
  bot.w = cvw / 50;
  bot.h = cvh / 4;
  bot.x = cvw / 120;
  bot.y *= cvw;
  user.w = cvw / 50;
  user.h = cvh / 4;
  user.x = cvw - cvw / 120;
  user.y *= cvw;
}

// accessing to the game from an unique tab
function checkifOpen() {
  if (localStorage.getItem('gameIsOpen')) {
    alert('The game is already open in another tab.');
    window.location.href = '/home';
  }
  else {
    localStorage.setItem('gameIsOpen', 'true');
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('gameData');
      localStorage.removeItem('gameIsOpen');
      if (ball.end === 0) ball.end = new Date().getTime();
    });
  }
}
let PracticeMode = () => {
  const [isFinished, setIsFinished] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  if (!isChecked){
    checkifOpen();
    setIsChecked(true);
  }
  useEffect(()=>{
    socket_game?.emit('trainingOn');
    return () => {
      socket_game?.on("notAllowed", ()=>{window.location.href = '/home'});
      socket_game?.emit('trainingOff');
      localStorage.removeItem("gameData");
      localStorage.removeItem("gameIsOpen");
      localStorage.removeItem("chakra-ui-color-mode");
    }
  });
  
  let results = new Results(user.user, bot.user, user.user, bot.score, user.score, ball.begin, ball.end);
  const preload = (p5: p5Types) => {
    bounceSound = p5.loadSound('/sfx/bounce.mp3');
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(cvw, cvh).parent(canvasParentRef);
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER);
    window.addEventListener("resize", updateDimensions);
    ball.begin = new Date().getTime();
    loadGameData();
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER);
  };

  const draw = (p5: p5Types) => {
    p5.resizeCanvas(cvw, cvh);
    game_drawer(p5);
    user_mover(p5);
    bot_mover();
    ball_mover();
    saveGameData();
    if (user.score === win || bot.score === win)
    {
      ball.end = new Date().getTime();
      setIsFinished(true);
      localStorage.removeItem('gameIsOpen');
      localStorage.removeItem('gameData');
      p5.noLoop();
    }
  };
  return (isFinished ? <GameResults results={results} /> : <Sketch preload={preload} setup={setup} draw={draw} className={'game'}/>);
};

function game_drawer(p5: p5Types) {
  p5.background("#2D097F");
  p5.noFill();
  p5.stroke("#CCD6DD");
  p5.rect(cvw / 2, cvh / 2, cvw, cvh);
  p5.rect(0, cvh / 2, cvw, cvh);
  //draw ball and players
  p5.fill("#CCD6DD");
  p5.noStroke();
  p5.circle(ball.x, ball.y, ball.d);
  p5.rect(user.x, user.y, user.w, user.h);
  p5.rect(bot.x, bot.y, bot.w, bot.h);
  //draw scores
  p5.textSize(cvh / 20 + 5);
  p5.text(bot.score, cvw / 3, cvh / 10);
  p5.text(user.score, cvw * 2 / 3, cvh / 10);
  p5.textSize(cvh / 30 + 5);
  p5.text(bot.user, cvw / 10, cvh / 10);
  p5.text(user.user, 9 * cvw / 10, cvh / 10);
}

function user_mover(p5: p5Types) {
  if (
    (p5.key === "w" || p5.keyCode === p5.UP_ARROW) &&
    p5.keyIsPressed &&
    user.y > user.h / 2
  )
    user.y -= user.speed/800*cvw;
  if (user.y < user.h / 2) user.y = user.h / 2;
  if (
    (p5.key === "s" || p5.keyCode === p5.DOWN_ARROW) &&
    p5.keyIsPressed &&
    user.y < cvh - user.h / 2
  )
    user.y += user.speed/800*cvw;
  if (user.y > cvh - user.h / 2) user.y = cvh - user.h / 2;
}

function bot_mover() {
  if (ball.velox < 0) bot.y += (ball.y - bot.y) * lvl;
  if (bot.y < bot.h / 2) bot.y = bot.h / 2;
  if (bot.y + bot.h / 2 > cvh) bot.y = cvh - bot.h / 2;
}

function ball_mover() {
  serving();
  moving();
  bouncing();
  if (ball.x >= cvw || ball.x <= 0) scoring();
}

function serving() {
  if (!ball.velox) {
		((bot.score + user.score) % 2) ? ball.velox = -1 : ball.velox = 1;
		ball.veloy = (Math.random() % 2) ? -1 : 1;
	}
}

function moving() {
  ball.x += ball.velox * (ball.hit + 3) /800*cvw;
  ball.y += ball.veloy * (ball.hit + 3) /800*cvw;
}

function bouncing() {
  if (ball.y + ball.d / 2 >= cvh || ball.y <= ball.d / 2) ball.veloy *= -1;
  if (ball.y + ball.d / 2 > cvh) ball.y = cvh - ball.d / 2;
  else if (ball.y < ball.d / 2) ball.y = ball.d / 2;
  let player_paddle = ball.velox > 0 ? user : bot;
  if (collision(player_paddle, ball)) {
    mechanics(player_paddle, ball);
    ball.velox *= -1;
    if (ball.hit < 13) {
      ball.hit++;
      user.speed++;
    }
  }
  if (bounceSound.isLoaded() && (ball.y + ball.d / 2 >= cvh || ball.y <= ball.d / 2 || collision(player_paddle, ball)))
    bounceSound.play();
}

function scoring() {
  if (ball.x >= cvw) bot.score++;
  if (ball.x <= 0) user.score++;
  ball.x = cvw / 2;
  ball.y = cvh / 2;
  ball.hit = 0;
  ball.velox = 0;
  user.speed = 5;
}

function mechanics(p: Paddle, b: Ball) {
  if (b.y > p.y - 1 && b.y < p.y + 1) b.veloy = 0;
  else if (b.y <= p.h / 2 || (!b.veloy && b.y < p.y)) b.veloy = -1;
  else if (b.y >= p.y + p.h / 2 || (!b.veloy && b.y > p.y)) b.veloy = 1;
}

function collision(p: Paddle, b: Ball) {
  let p_top = p.y - p.h / 2;
  let p_bottom = p.y + p.h / 2;
  let p_right = p.x + p.w / 2;
  let p_left = p.x - p.w / 2;
  let b_top = b.y - b.d / 2;
  let b_bottom = b.y + b.d / 2;
  let b_right = b.x + b.d / 2;
  let b_left = b.x - b.d / 2;
  return (
    p_top <= b_bottom &&
    p_bottom >= b_top &&
    p_right >= b_left &&
    p_left <= b_right
  );
}

export default PracticeMode;
