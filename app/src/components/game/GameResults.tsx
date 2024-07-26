/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameResults.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: codespace <codespace@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/02/20 14:06:05 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/09 18:09:13 by codespace        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useNavigate } from "react-router-dom";
import Sketch from "react-p5";
import p5Types from "p5";
import "p5/lib/addons/p5.sound";

class Ball {
  x: number;
  y: number;
  d: number;
  hit: number;
  velox: number;
  veloy: number;
  constructor() {
    this.d = cvh / 30;
    this.x = this.d / 2;
    this.y = (2 * cvh) / 3;
    this.hit = 3;
    this.velox = 1;
    this.veloy = 1;
  }
}

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

let bgSound: p5Types.SoundFile,
  winSound: p5Types.SoundFile,
  loseSound: p5Types.SoundFile,
  bounceSound: p5Types.SoundFile;
let cvw = window.innerWidth;
var cvh = window.innerHeight;
let fontSize = (cvh + 10) / 15;
const ball = new Ball();

function updateDimensions() {
  ball.y /= cvh;
  ball.x /= cvw;
  cvw = window.innerWidth;
  cvh = window.innerHeight;
  ball.y *= cvh;
  ball.x *= cvw;
  fontSize = (cvh + 10) / 15;
}

let GameResults = (prop: { results: Results }) => {
	const nav = useNavigate();
  
  const preload = (p5: p5Types) => {
    bgSound = p5.loadSound("/sfx/BGSoundEffect.mp3");
    bounceSound = p5.loadSound("/sfx/bounce.mp3");
    winSound = p5.loadSound("/sfx/win.mp3");
    loseSound = p5.loadSound("/sfx/lose.mp3");
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(cvw, cvh).parent(canvasParentRef);
    p5.frameRate(30);
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER);
    window.addEventListener("resize", updateDimensions);
    if (bgSound.isLoaded()) {
      bgSound.setVolume(0.5);
      bgSound.loop();
    }
    play_sound(prop.results);
  };

  const draw = (p5: p5Types) => {
    p5.resizeCanvas(cvw, cvh);
    p5.background("#150142");
    p5.textSize(fontSize);
    p5.noStroke();
    p5.fill("#FF7E03");
    p5.text(define_winner(prop.results), cvw / 2, cvh / 5);
    p5.fill("#CCD6DD");
    p5.textSize((fontSize * 3) / 4);
    p5.text(prop.results.userA, cvw / 4, (2 * cvh) / 5);
    p5.text(prop.results.userB, (3 * cvw) / 4, (2 * cvh) / 5);
    p5.text(prop.results.score1, cvw / 4, (3 * cvh) / 5);
    p5.text(prop.results.score2, (3 * cvw) / 4, (3 * cvh) / 5);
    p5.textSize((fontSize * 2) / 3);
    p5.text(
      "You played for " + getDuration(prop.results),
      cvw / 2,
      (4 * cvh) / 5,
    );
    ball_mover();
    p5.circle(ball.x, ball.y, ball.d);
  };

  return (
    <div className="game">
      <Sketch preload={preload} setup={setup} draw={draw} />
      <button
        className="backFromGameButton"
        onClick={() => nav(-1)}
      >
        Go back
      </button>
    </div>
  );
};

function define_winner(results: Results): string {
  if (results.username === "") return "";
  if (
    (results.score1 > results.score2 && results.username === results.userA) ||
    (results.score2 > results.score1 && results.username === results.userB)
  )
    return "Congratulations! You won!";
  return "It's okay! Next time!";
}

function play_sound(results: Results){
  if (results.username === "") return;
  if (
    (results.score1 > results.score2 && results.username === results.userA) ||
    (results.score2 > results.score1 && results.username === results.userB)
  ) {
    if (winSound.isLoaded()) {
        winSound.setVolume(1);
        winSound.play();
      }
    }
  else if (loseSound.isLoaded()) {
    loseSound.setVolume(1);
    loseSound.play();
  }
}

function getDuration(results: Results): string {
  const duration = Math.abs(results.end - results.begin) / 1000; // Convert to seconds
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes} min ${seconds} sec`;
}

function ball_mover() {
  ball.x += ((ball.velox * (ball.hit + 2)) / 800) * cvw;
  ball.y += ((ball.veloy * (ball.hit + 2)) / 800) * cvw;
  if (ball.x + ball.d / 2 >= cvw || ball.x <= ball.d / 2) ball.velox *= -1;
  if (ball.y + ball.d / 2 >= cvh || ball.y <= ball.d / 2) ball.veloy *= -1;
  if (ball.y + ball.d / 2 > cvh) ball.y = cvh - ball.d / 2;
  else if (ball.y < ball.d / 2) ball.y = ball.d / 2;
  if (ball.x + ball.d / 2 > cvw) ball.x = cvw - ball.d / 2;
  else if (ball.x < ball.d / 2) ball.x = ball.d / 2;
  if (
    bounceSound.isLoaded() &&
    (ball.y + ball.d / 2 >= cvh ||
      ball.y <= ball.d / 2 ||
      ball.x + ball.d / 2 >= cvw ||
      ball.x <= ball.d / 2)
  ) {
    bounceSound.setVolume(0.2);
    bounceSound.play();
  }
}

export default GameResults;
