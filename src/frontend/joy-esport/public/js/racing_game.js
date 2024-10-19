
function max(a, b) {
    if (a < b) {
        return b;
    }
    else {
        return a;
    }
}
function min(a, b) {
    if (a < b) {
        return a;
    }
    else {
        return b;
    }
}


window.onload = function () {
    // 페이지 로드 시 실행되는 함수
    const token = localStorage.getItem('joy_token');  // localStorage에서 joy_token 값 가져오기

    if (token) {
        validateToken(token)
            .then(() => {
                return Promise.all([
                    getUserData(token),
                    getGuitarData(token),
                ]);

            }).then(() => {
                return new Promise((resolve, reject) => {
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    const desiredRatio = 3 / 5;
                    const gameContainer = document.getElementById("game-container");

                    if (screenWidth / screenHeight > desiredRatio) {
                        // 화면이 더 넓을 때: 높이에 맞춰 너비 조정
                        gameContainer.style.height = screenHeight + 'px';
                        gameContainer.style.width = (screenHeight * desiredRatio) + 'px';
                    } else {
                        // 화면이 더 높을 때: 너비에 맞춰 높이 조정
                        gameContainer.style.width = screenWidth + 'px';
                        gameContainer.style.height = (screenWidth / desiredRatio) + 'px';
                    }
                    resolve();
                });
            }).then(() => {
                return new Promise((resolve, reject) => {
                    document.getElementById("loading_screen").style.display = "none";
                    resolve();
                });

            }).then(() => {
                game();
            });
    }
    else {
        window.location.href = "/login";
    }

    // 토큰을 검증하는 함수
    function validateToken(token) {
        return new Promise((resolve, reject) => {
            fetch(url("/api/auth/valid"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token }),  // token 값을 JSON으로 보냄
            })
                .then(response => response.text())  // 응답을 텍스트로 받음
                .then(data => {
                    if (data === 'true') {
                        resolve();
                    } else {
                        localStorage.removeItem('joy_token');  // 유효하지 않으면 토큰 제거
                        window.location.href = "/login";
                        reject(error);
                    }
                })
                .catch(error => {
                    localStorage.removeItem('joy_token');  // 유효하지 않으면 토큰 제거
                    window.location.href = "/login";
                    reject(error);
                });
        });
    }

    function getUserData(token) {

        fetch(url("/api/auth/user"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
        })
            .then(response => response.json())
            .then(data => {
                // document.getElementById("user-name").innerText = data["name"];
            })
    }

    function getGuitarData(token) {
        fetch(url("/api/game/guitar/get_score"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
        })
            .then(response => response.json())
            .then(data => {
                // document.getElementById("guitar_score").innerText = data["score"];
            })
    }
};

function game() {

    let gameOver = false;
    let scoreText;
    let score = 0;
    let blockSpeed = 1;

    let tick;
    let maxTick;
    let frets = [];
    let fretLayer;
    let player;
    let playerIdx = 2;
    let playerTick = 10;

    let opstacles = [];
    let opstacleLayer;
    let opstacleTick = 0;

    let fastTick = 0;

    const opstacleMaxTick = 3;
    const playerMaxTick = 7;
    const gameWidth = document.getElementById("game-container").clientWidth;
    const gameHeight = document.getElementById("game-container").clientHeight;
    const defaultWidth = gameWidth / 600;
    const defaultHeight = gameHeight / 1000;
    const blockHeight = 50 * defaultHeight;
    const topCoor = [gameWidth / 2 - defaultWidth * 100, gameWidth / 2 - defaultWidth * 50, gameWidth / 2, gameWidth / 2 + defaultWidth * 50, gameWidth / 2 + defaultWidth * 100];
    const playerCoor = [gameWidth / 2 - defaultWidth * 200, gameWidth / 2 - defaultWidth * 100, gameWidth / 2, gameWidth / 2 + defaultWidth * 100, gameWidth / 2 + defaultWidth * 200];
    const playerSize = defaultWidth * 70;
    const fretWidth = 580 * defaultWidth;
    const opstacleSize = defaultWidth * 70;
    const playerHeight = gameHeight - playerSize * 1.5;
    const fastMaxTick = 150;
    let player_image;
    let touch_hand;
    let touch_flag;
    let gameOverFlag;

    let cursors;

    let testText;

    function ratio(y) {
        return 0.000565 * y + 0.44;
    }

    class StartScene extends Phaser.Scene {
        constructor() {
            super({ key: 'StartScene' });
        }
        preload() {
            this.load.image('guitarNeckImage', 'images/racing_body.png');
            this.load.image('guitarStringImage', 'images/racing_string.png');
            this.load.image('guitarFretImage', 'images/racing_fret.png');
            this.load.image('homeButton', 'images/home_button_white.png');
            this.load.image('touch_hand', 'images/touch_hand.png');
            this.load.image('touch_target', 'images/touch_target.png');
            this.load.image('title', 'images/running_game_title_font.png');
        }
        create() {
            // 시작 화면 생성
            this.cameras.main.setBackgroundColor('#000000');

            touch_flag = false;

            // 배경이미지
            let body = this.add.image(gameWidth / 2, gameHeight / 2, 'guitarNeckImage');
            body.displayWidth = defaultWidth * 600;
            body.displayHeight = defaultHeight * 1000;

            for (let i = 0; i < 5; i++) {
                let fret = this.add.image(gameWidth / 2, defaultHeight * (100 + i * 200), 'guitarFretImage');
                fret.displayWidth = fretWidth * ratio(100 + i * 200);
                fret.displayHeight = defaultHeight * 50;
            }

            let string = this.add.image(gameWidth / 2, gameHeight / 2, 'guitarStringImage');
            string.displayWidth = defaultWidth * 550;
            string.displayHeight = defaultHeight * 1000;

            // 흰색 반투명 배경 (50% 투명도)
            // let overlay = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0xffffff, 0.3);

            // 타이틀
            let titleText = this.add.image(gameWidth / 2, gameHeight / 2 - blockHeight * 2, 'title');
            titleText.displayWidth = defaultWidth * 500;
            titleText.displayHeight = defaultHeight * 237;
            titleText.setAlpha(0.8);

            // 화면 터치 애니메이션
            touch_hand = this.add.image(gameWidth / 2, gameHeight / 2 + blockHeight * 4, 'touch_hand');
            touch_hand.displayWidth = defaultWidth * 120;
            touch_hand.displayHeight = defaultWidth * 120;

            let touch_target = this.add.image(gameWidth / 2, gameHeight / 2 + blockHeight * 4, 'touch_target');
            touch_target.displayWidth = defaultWidth * 120;
            touch_target.displayHeight = defaultWidth * 120;

            // 화면 클릭 시 게임 플레이 씬으로 전환
            this.input.on('pointerdown', () => {
                this.scene.start('GameScene'); // 게임 플레이 씬으로 전환
            });

            // 우측 상단에 홈 버튼 추가
            let homeButton = this.add.image(gameWidth - defaultWidth * 50, defaultWidth * 50, 'homeButton').setInteractive();
            homeButton.displayWidth = defaultWidth * 75;
            homeButton.displayHeight = defaultHeight * 75;
            homeButton.setAlpha(0.5);
            // 홈 버튼 클릭 시 루트 경로로 이동
            homeButton.on('pointerdown', () => {
                window.location.href = '/';
            });
        }
        update() {
            if (touch_hand.x < gameWidth / 2) {
                touch_flag = true;
            }
            if (touch_hand.x > gameWidth / 2 + defaultWidth * 10) {
                touch_flag = false;
            }
            if (touch_flag) {
                touch_hand.x += 0.2;
                touch_hand.y += 0.2;
            }
            else {
                touch_hand.x -= 0.2;
                touch_hand.y -= 0.2;
            }
        }
    }

    class GameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene' });
        }

        preload() {
            this.load.image('guitarNeckImage', 'images/racing_body.png');
            this.load.image('guitarStringImage', 'images/racing_string.png');
            this.load.image('guitarFretImage', 'images/racing_fret.png');
            this.load.image('obstacleImage', 'images/red_peak.png');
            this.load.image('homeButton', 'images/home_button_white.png');
            this.load.image('touch_hand', 'images/touch_hand.png');
            this.load.image('touch_target', 'images/touch_target.png');
            this.load.image('playerImage', 'images/green_peak.png')
        }

        create() {
            // 초기화
            frets = [];
            opstacles = [];
            opstacleTick = 2;
            gameOver = false;
            score = 0;
            blockSpeed = defaultHeight * 6;
            tick = 0;
            maxTick = 100;

            playerIdx = 2;
            playerTick = playerMaxTick;
            gameOverFlag = false;
            cursors = this.input.keyboard.createCursorKeys();

            // 배경이미지
            let body = this.add.image(gameWidth / 2, gameHeight / 2, 'guitarNeckImage');
            body.displayWidth = defaultWidth * 600;
            body.displayHeight = defaultHeight * 1000;

            fretLayer = this.add.layer();

            for (let i = 0; i < 5; i++) {
                let fret = this.add.image(gameWidth / 2, defaultHeight * (10 + i * 200), 'guitarFretImage');
                fret.displayWidth = fretWidth * ratio(10 + i * 200);
                fret.displayHeight = defaultHeight * 50;
                fretLayer.add(fret);
                frets.push(fret);
            }

            let string = this.add.image(gameWidth / 2, gameHeight / 2, 'guitarStringImage');
            string.displayWidth = defaultWidth * 550;
            string.displayHeight = defaultHeight * 1000;

            this.cameras.main.setBackgroundColor('#000000');

            player = this.add.rectangle(playerCoor[2], playerHeight, playerSize, playerSize);
            player_image = this.add.image(player.x, player.y, 'playerImage');
            player_image.displayWidth = playerSize;
            player_image.displayHeight = playerSize;

            opstacleLayer = this.add.layer();

            const graphics = this.add.graphics();


            // "점수"
            scoreText = this.add.text(defaultWidth * 40, defaultHeight * 50, '0', {
                font: `${defaultWidth * 100}px MapleBold`,
                fill: '#ffffff'
            });
            scoreText.setAlpha(0.4);
            scoreText.setOrigin(0.2, 0)

            // 테스트
            // testText = this.add.text(defaultWidth * 40, defaultHeight * 100, '0', {
            //     font: `${defaultWidth * 100}px MapleBold`,
            //     fill: '#ffffff'
            // });
            // scoreText.setAlpha(0.4);
            // scoreText.setOrigin(0.2, 0)

            let left_screen = this.add.rectangle(gameWidth * 0.25, gameHeight / 2, gameWidth / 2, gameHeight, 0xffffff, 0).setInteractive();
            let right_screen = this.add.rectangle(gameWidth * 0.75, gameHeight / 2, gameWidth / 2, gameHeight, 0xffffff, 0).setInteractive();
            // 터치 이벤트 추가
            left_screen.on('pointerdown', () => leftMove(this))
            right_screen.on('pointerdown', () => rightMove(this));
        }
        update() {
            // testText.text = `${Math.floor(this.game.loop.actualFps)}`
            // 게임
            player_image.x = player.x;
            player_image.y = player.y;
            if (!gameOver) {
                // 키보드 입력
                if (cursors.left.isDown) {
                    leftMove(this);
                }
                else if (cursors.right.isDown) {
                    rightMove(this);
                }


                // 주기
                let fps = this.game.loop.actualFps;
                tick += (60 / fps);
                fastTick += (60 / fps);
                playerTick = min(playerTick + 1, playerMaxTick);


                // 프레임에 따른 변동 속도
                blockSpeed = (defaultHeight * 5 + (8 * (100 - maxTick) / 100) * defaultHeight * 5) * (60 / this.game.loop.actualFps);

                if (parseInt(fastTick) >= fastMaxTick) {
                    fastTick = 0;
                    maxTick = max(maxTick - 5, 15);
                }
                if (parseInt(tick) >= maxTick) {
                    tick = 0;

                    // 프렛 생성
                    let fret = this.add.image(gameWidth / 2, 0, 'guitarFretImage');
                    fret.displayWidth = fretWidth * ratio(0);
                    fret.displayHeight = defaultHeight * 50;
                    fretLayer.add(fret);
                    frets.push(fret);

                    // 장애물 생성
                    opstacleTick += 1;
                    if (opstacleTick >= opstacleMaxTick) {
                        opstacleTick = 0;

                        const numbers = [0, 1, 2, 3, 4];
                        for (let i = numbers.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
                        }
                        numbers.slice(0, Phaser.Math.Between(3, 4)).forEach(n => {
                            let opstacle = this.add.image(topCoor[n], 0, 'obstacleImage');
                            opstacle.displayWidth = opstacleSize * ratio(0);
                            opstacle.displayHeight = defaultHeight * 30;
                            opstacleLayer.add(opstacle);
                            opstacles.push([opstacle, n]);
                        });

                        // 장애물 생성될때마다 점수
                        score += 1;
                        scoreText.text = `${score}`
                    }
                }


                // 프렛 이동
                frets.forEach(fret => {
                    fret.y += blockSpeed * ratio(fret.y / defaultHeight);
                    fret.displayWidth = fretWidth * ratio(fret.y / defaultHeight);

                    if (fret.y > gameHeight * 1.2) {
                        fret.destroy();
                    }
                });

                // 장애물 이동
                for (let i = opstacles.length - 1; i >= 0; i--) {
                    let opstaclelst = opstacles[i];
                    let opstacle = opstaclelst[0];
                    let line = opstaclelst[1];

                    opstacle.y += blockSpeed * ratio(opstacle.y / defaultHeight);

                    opstacle.displayWidth = opstacleSize * ratio(opstacle.y / defaultHeight);
                    opstacle.displayHeight = opstacleSize * ratio(opstacle.y / defaultHeight);
                    opstacle.x = topCoor[line] + (playerCoor[line] - topCoor[line]) * parseInt((opstacle.y / defaultHeight)) / 1000;

                    // 충돌판정
                    if (playerHeight - playerSize / 2 < opstacle.y && opstacle.y < playerHeight + playerSize / 2 && playerIdx == line) {
                        gameOver = true;
                    }

                    if (opstacle.y > gameHeight * 1.2) {
                        opstacle.destroy();
                        opstacles.splice(i, 1);
                    }
                }

            }

            if (gameOver) {
                if (gameOverFlag == false) {
                    gameOverFlag = true;
                    this.tweens.add({
                        targets: player,
                        y: gameHeight + playerSize,
                        duration: 500,
                        onComplete: () => {
                            gameOverFunc(this);
                        }
                    });
                }
                if (touch_hand.x < gameWidth / 2) {
                    touch_flag = true;
                }
                if (touch_hand.x > gameWidth / 2 + defaultWidth * 10) {
                    touch_flag = false;
                }
                if (touch_flag) {
                    touch_hand.x += 0.2;
                    touch_hand.y += 0.2;
                }
                else {
                    touch_hand.x -= 0.2;
                    touch_hand.y -= 0.2;
                }

            }
        }
    }

    function leftMove(scene) {
        if (!gameOver && playerIdx > 0 && playerMaxTick == playerTick) {
            playerTick = 0;
            playerIdx -= 1;
            scene.tweens.add({
                targets: player,
                x: playerCoor[playerIdx],
                duration: 100,
                ease: 'Linear',
                onComplete: () => {
                    player.x = playerCoor[playerIdx];
                }
            });
        }
    }

    function rightMove(scene) {
        if (!gameOver && playerIdx < 4 && playerMaxTick == playerTick) {
            playerTick = 0;
            playerIdx += 1;
            scene.tweens.add({
                targets: player,
                x: playerCoor[playerIdx],
                duration: 100,
                ease: 'Linear',
                onComplete: () => {
                    player.x = playerCoor[playerIdx];
                }
            });
        }
    }

    function gameOverFunc(scene) {
        fetch(url("/api/game/safe/add_point"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: localStorage.getItem('joy_token'), point: parseInt(score / 5) }),
        });

        fetch(url("/api/game/racing/set_score"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: localStorage.getItem('joy_token'), score: score }),
        }).then(response => response.json())
            .then(data => {
                let maxScore = data["maxScore"];
                let nowScore = data["nowScore"];
                // 점수
                let maxScoreText = scene.add.text(gameWidth / 2, gameHeight / 2 - defaultHeight * 120, `최대 점수: ${maxScore}`, {
                    font: `${defaultWidth * 50}px MapleLight`,
                    fill: '#000000'
                });
                maxScoreText.setOrigin(0.5, 0.5); // 텍스트 중앙 정렬
                let nowScoreText = scene.add.text(gameWidth / 2, gameHeight / 2 - defaultHeight * 50, `현재 점수: ${nowScore}`, {
                    font: `${defaultWidth * 50}px MapleLight`,
                    fill: '#000000'
                });
                nowScoreText.setOrigin(0.5, 0.5); // 텍스트 중앙 정렬

                // 화면 터치 애니메이션
                touch_hand = scene.add.image(gameWidth / 2, gameHeight / 2 + blockHeight * 4, 'touch_hand');
                touch_hand.displayWidth = defaultWidth * 120;
                touch_hand.displayHeight = defaultWidth * 120;

                let touch_target = scene.add.image(gameWidth / 2, gameHeight / 2 + blockHeight * 4, 'touch_target');
                touch_target.displayWidth = defaultWidth * 120;
                touch_target.displayHeight = defaultWidth * 120;

                // 화면 클릭 시 게임 플레이 씬으로 전환
                scene.input.on('pointerdown', () => {
                    scene.scene.start('GameScene'); // 게임 플레이 씬으로 전환
                });

                // 우측 상단에 홈 버튼 추가
                let homeButton = scene.add.image(gameWidth - defaultWidth * 50, defaultWidth * 50, 'homeButton').setInteractive();
                homeButton.displayWidth = defaultWidth * 75;
                homeButton.displayHeight = defaultHeight * 75;
                homeButton.setAlpha(0.5);
                // 홈 버튼 클릭 시 루트 경로로 이동
                homeButton.on('pointerdown', () => {
                    window.location.href = '/';
                });
            });


    }



    const config = {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }, // 중력 제거
                debug: false,
            }
        },
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
        scene: [StartScene, GameScene]
    };

    const game = new Phaser.Game(config);

}

