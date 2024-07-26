/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WaitingRoom.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: codespace <codespace@student.42.fr>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/02/17 18:53:12 by mel-kora          #+#    #+#             */
/*   Updated: 2024/03/08 23:11:07 by codespace        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Sketch from "react-p5";
import p5Types from "p5";
import "p5/lib/addons/p5.sound";
import { useNavigate } from "react-router-dom";

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
		this.y = 2 * cvh / 3;
		this.hit = 3;
		this.velox = 1;
		this.veloy = 1;
	}
}

var	bgSound:p5Types.SoundFile, bounceSound:p5Types.SoundFile;
var	cvw = window.innerWidth;
var	cvh = window.innerHeight;
var	angle = 0;
var	fontSize = (cvh + 10) / 15;
let ball = new Ball();


function updateDimensions(){
	ball.y /= cvh;
	ball.x /= cvw;
	cvw = window.innerWidth;
	cvh = window.innerHeight;
	ball.y *= cvh;
	ball.x *= cvw;
	fontSize = (cvh + 10) / 15;
}

let	WaitingRoom = () => {
	const nav = useNavigate();
	
	const preload = (p5: p5Types) => {
		bgSound = p5.loadSound('/sfx/BGSoundEffect.mp3');
		bounceSound = p5.loadSound('/sfx/bounce.mp3');
	}
	
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.createCanvas(cvw, cvh).parent(canvasParentRef);
		p5.frameRate(30);
		p5.rectMode(p5.CENTER);
		p5.textAlign(p5.CENTER);
		window.addEventListener("resize", updateDimensions);
		if (bgSound.isLoaded()) {
			bgSound.setVolume(0.7);
			bgSound.loop();
		}
	}

	const draw = (p5: p5Types) => {
		p5.resizeCanvas(cvw, cvh);
		p5.background("#150142");
		p5.textSize(fontSize);
		p5.fill("#CCD6DD");
		p5.noStroke();
		ball_mover();
		p5.circle(ball.x, ball.y, ball.d);
		p5.fill('#FF7E03');
		fontSize = p5.map(p5.sin(angle), -1, 1, cvw / 20, cvh / 20);
		p5.text('Waiting for Opponent', cvw / 2, cvh / 2);
		angle += 0.1;
		if (angle == 2 * p5.PI) angle = 0;
	}

	return (<div className="game">
		<Sketch preload={preload} setup={setup} draw={draw}/>
		<button className="backFromGameButton" onClick={() => nav(-1)}>Go back</button></div>);
}

function ball_mover(){
	ball.x += ball.velox * (ball.hit + 2) /800*cvw;
	ball.y += ball.veloy * (ball.hit + 2) /800*cvw;
	if (ball.x + ball.d / 2 >= cvw || ball.x <= ball.d / 2) ball.velox *= -1;
	if (ball.y + ball.d / 2 >= cvh || ball.y <= ball.d / 2) ball.veloy *= -1;
	if (ball.y + ball.d / 2 > cvh) ball.y = cvh - ball.d / 2;
	else if (ball.y < ball.d / 2) ball.y = ball.d / 2;
	if (ball.x + ball.d / 2 > cvw) ball.x = cvw - ball.d / 2;
	else if (ball.x < ball.d / 2) ball.x = ball.d / 2;
	if (bounceSound.isLoaded() && (ball.y + ball.d / 2 >= cvh || ball.y <= ball.d / 2 || ball.x + ball.d / 2 >= cvw || ball.x <= ball.d / 2))
	{
		bounceSound.setVolume(0.2);
		bounceSound.play();
	}
}
  
export default WaitingRoom;
