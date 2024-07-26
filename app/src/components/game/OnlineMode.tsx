/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   OnlineMode.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: codespace <codespace@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/12/06 10:58:41 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/09 18:06:50 by codespace        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Sketch from "react-p5";
import p5Types from "p5";
import "p5/lib/addons/p5.sound";
import WaitingRoom from "./WaitingRoom";
import GameResults from "./GameResults";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socket_game } from "../../utils/client-socket";
import { useUser } from "../../hooks/useUser";
import { useChatStore } from "../chat/store";
import { useNavigate } from "react-router-dom";

class Results {
  username: string;
  userA: string;
  userB: string;
  score1: number;
  score2: number;
  begin: number;
  end: number;
  constructor() {
    this.username = "";
    this.userA = "";
    this.userB = "";
    this.score1 = 0;
    this.score2 = 0;
    this.begin = 0;
    this.end = 0;
  }
}
class Ball {
  x: number;
  y: number;
  d: number;
  hit: number;
  velox: number;
  veloy: number;
  begin: number;
  end: number;
  constructor(cvw: number, cvh: number) {
    this.x = cvw / 2;
    this.y = cvh / 2;
    this.d = cvh / 30;
    this.hit = 0;
    this.velox = 0;
    this.veloy = 1;
    this.begin = 0;
    this.end = 0;
  }
}

class Paddle {
  user: string;
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
  speed: number;
  constructor(user: string, x: number, y: number, cvw: number, cvh: number) {
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
let cvw = window.innerWidth * 0.8;
let cvh = cvw * 0.7;
while (cvh > window.innerHeight - 55) {
  cvw--;
  cvh = cvw * 0.7;
}
let ball = new Ball(cvw, cvh);
let p1 = new Paddle("", cvw / 120, cvh / 2, cvw, cvh);
let p2 = new Paddle("", cvw - cvw / 120, cvh / 2, cvw, cvh);
let results: Results;
let username = '';
let bounceSound: p5Types.SoundFile;

function updateDimensions(original_size: number) {
  p2.y /= original_size;
  p1.y /= original_size;
  ball.y /= original_size;
  ball.x /= original_size;
  cvw = window.innerWidth * 0.8;
  cvh = cvw * 0.7;
  while (cvh > window.innerHeight - 55) {
    cvw--;
    cvh = cvw * 0.7;
  }
  ball.y *= cvw;
  ball.x *= cvw;
  ball.d = cvh / 30;
  p1.w = cvw / 50;
  p1.h = cvh / 4;
  p1.x = cvw / 120;
  p1.y *= cvw;
  p2.w = cvw / 50;
  p2.h = cvh / 4;
  p2.x = cvw - cvw / 120;
  p2.y *= cvw;
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
      localStorage.removeItem('gameIsOpen');
      localStorage.removeItem('gameData');
      if (ball.end === 0) ball.end = new Date().getTime();
    });
  }
}
const OnlineMode = (prop: { type: string }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isCanceled, setIsCanceled] = useState(false);
	const { connect, disconnect } = useChatStore();
  const { user } = useUser();
  
  if (!isChecked){
    checkifOpen();
    setIsChecked(true);
  }
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    }
  }, []);
  
  useEffect(() => {
    socket_game?.emit("JoinWaitRoom", prop.type);
    socket_game?.on("startGame", () => {
      setIsWaiting(false);
    });
    socket_game?.on('gameCanceled', ()=>{
      setIsCanceled(true);
    });
    socket_game?.on("gameEnded", async (result: Results) => {
      socket_game?.emit("gameEnd");
      setIsFinished(true);
      results = result;
      results.username = username;
    });
    socket_game?.on(
      "gameData",
      (data: { ball: Ball; p1: Paddle; p2: Paddle; cvw: number }) => {
        ball = data.ball;
        p1 = data.p1;
        p2 = data.p2;
        updateDimensions(data.cvw);
      },
    );
    socket_game?.on("ballBounce", () => {
      if (bounceSound.isLoaded()) bounceSound.play();
    });

    return () => {
      socket_game?.emit("gameEnd");
      socket_game?.off("gameData");
      socket_game?.off("startGame");
      socket_game?.off("gameEnded");
      socket_game?.off("ballBounce");
      socket_game?.off("gameCanceled");
      localStorage.removeItem("gameData");
      localStorage.removeItem("gameIsOpen");
      localStorage.removeItem("chakra-ui-color-mode");
    };
  }, []);
  
  const nav = useNavigate();
  if (isCanceled) {
    socket_game?.emit('gameEnd');
    nav(0);
  }
  
  const preload = (p5: p5Types) => {
    bounceSound = p5.loadSound("/sfx/bounce.mp3");
  };
  const setup = async (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(cvw, cvh).parent(canvasParentRef);
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER);
    username = user?.name;
  };
  const draw = (p5: p5Types) => {
    p5.resizeCanvas(cvw, cvh);
    game_drawer(p5);
    p_mover(p5, socket_game);
  };
  
  return isFinished ? (
    <GameResults results={results} />
  ) : (isWaiting && prop.type.length > 1) ? (
    <WaitingRoom />
  ) : (
    <Sketch preload={preload} setup={setup} draw={draw} className={"game"} />
  );
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
  p5.rect(p2.x, p2.y, p2.w, p2.h);
  p5.rect(p1.x, p1.y, p1.w, p1.h);
  //draw scores
  p5.textSize(cvh / 20 + 5);
  p5.text(p1.score, cvw / 3, cvh / 10);
  p5.text(p2.score, (cvw * 2) / 3, cvh / 10);
  p5.textSize(cvh / 30 + 5);
  p5.text(p1.user, cvw / 10, cvh / 10);
  p5.text(p2.user, (9 * cvw) / 10, cvh / 10);
}

function p_mover(p5: p5Types, socket: Socket) {
  if ((p5.key === "w" || p5.keyCode === p5.UP_ARROW) && p5.keyIsPressed)
    socket?.emit("playerMoveUp");
  if ((p5.key === "s" || p5.keyCode === p5.DOWN_ARROW) && p5.keyIsPressed)
    socket?.emit("playerMoveDown");
}

export default OnlineMode;