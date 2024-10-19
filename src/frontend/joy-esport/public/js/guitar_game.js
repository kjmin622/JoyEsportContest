
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
    document.getElementById("loading_screen").style.display = "block";
    if (token) {
        validateToken(token)
            .then(() => {
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
};

function game() {

    let base;
    let movingBlock;
    let movingBlockImage;
    let stackHeight = 0;
    let clouds = []; // 생성된 구름을 저장하는 배열
    let gameOver = false;
    let currentBackgroundColor = { r: 135, g: 206, b: 235 }; // 초기 하늘색 (RGB)
    let scoreText;
    let score = 0;
    let blockSpeed = 200;
    let cloudLayer;
    const gameWidth = document.getElementById("game-container").clientWidth;
    const gameHeight = document.getElementById("game-container").clientHeight;
    const defaultWidth = gameWidth / 600;
    const defaultHeight = gameHeight / 1000;
    const blockHeight = 50 * defaultHeight;

    let touch_hand;
    let touch_flag;

    class StartScene extends Phaser.Scene {
        constructor() {
            super({ key: 'StartScene' });
        }
        preload() {
            this.load.image('blockImage', 'images/guitar_tower.png');
            this.load.image('guitarBodyImage', 'images/guitar_body.png');
            this.load.image('cloud', 'images/cloud.png');
            this.load.image('homeButton', 'images/home_button.png');
            this.load.image('title', 'images/guitar_game_title_font.png');
            this.load.image('touch_hand', 'images/touch_hand.png');
            this.load.image('touch_target', 'images/touch_target.png');
        }
        create() {
            // 시작 화면 생성
            this.cameras.main.setBackgroundColor('#87CEEB');

            touch_flag = false;

            // 배경이미지
            let body = this.add.image(gameWidth / 2 - defaultWidth * 3, gameHeight + defaultHeight * 213, 'guitarBodyImage');
            body.displayWidth = defaultWidth * 1078;
            body.displayHeight = defaultWidth * 1328;

            for (var i = 0; i < 3; i++) {
                let cloud = this.add.image(defaultWidth * 40, 2 * blockHeight * (1 + i * 2), 'cloud');
                cloud.displayWidth = defaultWidth * 300;
                cloud.displayHeight = defaultHeight * 150;
                if (i == 1) {
                    cloud.x = defaultWidth * 560;
                }
                else if (i == 2) {
                    cloud.x = defaultWidth * 200;
                }
            }

            for (var i = 0; i < 15; i++) {
                let movingBlockImage1 = this.add.image(gameWidth / 2, gameHeight / 2 + blockHeight / 2 - blockHeight * i, 'blockImage');
                movingBlockImage1.displayHeight = blockHeight;
                movingBlockImage1.displayWidth = defaultWidth * 150;
            }

            // 흰색 반투명 배경 (50% 투명도)
            let overlay = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0xffffff, 0.3);

            // 타이틀
            let titleText = this.add.image(gameWidth / 2, gameHeight / 2 - blockHeight * 2, 'title');
            titleText.displayWidth = defaultWidth * 420;
            titleText.displayHeight = defaultHeight * 137;
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
            this.load.image('blockImage', 'images/guitar_tower.png');
            this.load.image('guitarBodyImage', 'images/guitar_body.png');
            this.load.image('cloud', 'images/cloud.png');
            this.load.image('homeButton', 'images/home_button.png');
        }

        create() {
            // 초기화
            stackHeight = 0;
            clouds = []; // 생성된 구름을 저장하는 배열
            gameOver = false;
            currentBackgroundColor = { r: 135, g: 206, b: 235 };
            score = 0;
            blockSpeed = 200;

            const graphics = this.add.graphics();

            cloudLayer = this.add.layer();

            this.cameras.main.setBackgroundColor('#87CEEB'); // 배경을 푸른 하늘색으로 설정


            base = this.add.rectangle(gameWidth / 2, gameHeight - 30);
            base.width = defaultWidth * 150;

            // 첫 블록 생성
            movingBlock = this.add.rectangle(defaultWidth * 75, gameHeight / 2 + blockHeight / 2, defaultWidth * 150, blockHeight); // 파란색 블록
            this.physics.add.existing(movingBlock);
            movingBlock.body.setVelocityX(blockSpeed * defaultWidth);


            // 블록 이미지
            movingBlockImage = this.add.image(movingBlock.x, movingBlock.y, 'blockImage');
            movingBlockImage.displayHeight = blockHeight;
            movingBlockImage.displayWidth = movingBlock.width;

            // 기반 생성
            let body = this.add.image(gameWidth / 2 - defaultWidth * 3, gameHeight + defaultHeight * 213, 'guitarBodyImage');
            body.displayWidth = defaultWidth * 1078;
            body.displayHeight = defaultWidth * 1328;


            // 구름 생성
            createCloud(this);

            // "점수"
            scoreText = this.add.text(gameWidth / 2, defaultHeight * 70, '0', {
                font: `${defaultWidth * 200}px MapleBold`,
                fill: '#000000'
            });
            scoreText.displayWidth = defaultWidth * 100;
            scoreText.setAlpha(0.5);
            scoreText.setOrigin(0.5, 0)

            // 터치 이벤트 추가
            this.input.on('pointerdown', () => {
                if (!gameOver) {
                    placeBlock(this);
                }
            });
        }
        update() {
            // 블록이 화면 끝에 닿으면 방향 전환

            // 이미지의 위치와 크기를 movingBlock에 맞게 업데이트
            movingBlockImage.x = movingBlock.x; // x 좌표 동기화
            movingBlockImage.y = movingBlock.y; // y 좌표 동기화
            movingBlockImage.displayWidth = movingBlock.width; // 너비를 movingBlock과 동일하게 유지

            if (movingBlock.x >= gameWidth - movingBlock.width / 2) {
                movingBlock.body.setVelocityX(-blockSpeed * defaultWidth);
            }
            else if (movingBlock.x <= movingBlock.width / 2) {
                movingBlock.body.setVelocityX(blockSpeed * defaultWidth);
            }

            // 점수 동적으로

            scoreText.setFontSize(max(defaultWidth * 200, parseInt(scoreText.style.fontSize, 10) * 0.99));
            let redcode = parseInt(scoreText.style.color.substring(1, 3), 16);
            if (redcode !== 0) {
                redcode -= 1;
                let code = '';
                if (redcode < 16) {
                    code = '0'
                }
                code += redcode.toString(16);
                scoreText.setColor(`#${code}0000`);
            }



            if (gameOver) {
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

    // 구름 생성 함수
    function createCloud(scene) {
        const cloudX = Phaser.Math.Between(0, config.width); // 랜덤 x 위치
        const cloudY = - stackHeight * blockHeight;
        const cloud = scene.add.image(cloudX, cloudY, 'cloud');
        cloud.displayWidth = defaultWidth * 300;
        cloud.displayHeight = defaultHeight * 150;

        cloudLayer.add(cloud);

        // 구름을 화면에 추가하고 배열에 저장
        clouds.push(cloud);

    }

    // 배경색 변경 함수
    function updateBackgroundColor(scene) {
        // 푸른 하늘에서 노을 색으로 천천히 변환 (RGB)
        if (currentBackgroundColor.r < 255) {
            currentBackgroundColor.r += 1; // 빨간색 증가
        }
        if (currentBackgroundColor.g > 100) {
            currentBackgroundColor.g -= 1; // 녹색 감소
        }
        if (currentBackgroundColor.b > 100) {
            currentBackgroundColor.b -= 1; // 파란색 감소
        }

        // 배경색 업데이트

        scene.cameras.main.setBackgroundColor(`rgb(${currentBackgroundColor.r}, ${currentBackgroundColor.g}, ${currentBackgroundColor.b})`);
    }


    function placeBlock(scene) {
        let blockX = movingBlock.x;
        let baseX = base.x;
        let baseWidth = base.width;
        let blockWidth = movingBlock.width;

        // 둘 사이에 떨어진 정도
        let offset = Math.abs(blockX - baseX);

        // 보정
        if (offset < 3) {
            offset = 0;
            blockX = baseX;
        }

        // 게임 종료
        if (offset >= movingBlock.width || (blockWidth - offset) <= 3) {
            gameOver = true;
            scene.tweens.add({
                targets: movingBlock,
                y: movingBlock.y + 1000,
                duration: 1000,
                ease: 'Linear',
                onComplete: () => {
                    movingBlock.destroy();
                    // 포인트 쌓기
                    fetch(url("/api/game/safe/add_point"), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: localStorage.getItem('joy_token'), point: parseInt(score / 5) }),
                    }).then(response => {
                        if (!response.ok) {
                            console.log("point error");
                        }
                    });

                    // 점수 보내기
                    fetch(url("/api/game/guitar/set_score"), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: localStorage.getItem('joy_token'), score: score }),
                    }).then(response => response.json())
                        .then(data => {
                            let maxScore = data["maxScore"];
                            let nowScore = data["nowScore"];
                            // 다시 시작 화면
                            // 흰색 반투명 배경 (50% 투명도)
                            let overlay = scene.add.rectangle(gameWidth / 2, gameHeight / 2 - blockHeight * stackHeight, gameWidth, gameHeight, 0xffffff, 0.5);

                            // 점수
                            let maxScoreText = scene.add.text(gameWidth / 2, gameHeight / 2 - defaultHeight * 120 - blockHeight * stackHeight, `최대 점수: ${maxScore}`, {
                                font: `${defaultWidth * 50}px MapleLight`,
                                fill: '#000000'
                            });
                            maxScoreText.setOrigin(0.5, 0.5); // 텍스트 중앙 정렬
                            let nowScoreText = scene.add.text(gameWidth / 2, gameHeight / 2 - defaultHeight * 50 - blockHeight * stackHeight, `현재 점수: ${nowScore}`, {
                                font: `${defaultWidth * 50}px MapleLight`,
                                fill: '#000000'
                            });
                            nowScoreText.setOrigin(0.5, 0.5); // 텍스트 중앙 정렬

                            // 화면 터치 애니메이션
                            touch_hand = scene.add.image(gameWidth / 2, gameHeight / 2 + blockHeight * 4 - blockHeight * stackHeight, 'touch_hand');
                            touch_hand.displayWidth = defaultWidth * 120;
                            touch_hand.displayHeight = defaultWidth * 120;

                            let touch_target = scene.add.image(gameWidth / 2, gameHeight / 2 + blockHeight * 4 - blockHeight * stackHeight, 'touch_target');
                            touch_target.displayWidth = defaultWidth * 120;
                            touch_target.displayHeight = defaultWidth * 120;

                            // 화면 클릭 시 게임 플레이 씬으로 전환
                            scene.input.on('pointerdown', () => {
                                scene.scene.start('GameScene'); // 게임 플레이 씬으로 전환
                            });

                            // 우측 상단에 홈 버튼 추가
                            let homeButton = scene.add.image(gameWidth - defaultWidth * 50, defaultWidth * 50 - blockHeight * stackHeight, 'homeButton').setInteractive();
                            homeButton.displayWidth = defaultWidth * 75;
                            homeButton.displayHeight = defaultHeight * 75;
                            // 홈 버튼 클릭 시 루트 경로로 이동
                            homeButton.on('pointerdown', () => {
                                window.location.href = '/';
                            });
                        });
                }
            })
            scene.physics.pause();
        } else {
            // 블록이 기반에서 벗어난 부분 자르기
            let newBlockWidth = blockWidth - offset;

            let cut_x;

            if (newBlockWidth > 0) {
                let newBlock = scene.add.rectangle(0, movingBlock.y, newBlockWidth, blockHeight, 0x00FFFF);
                if (blockX < baseX) {
                    newBlock.x = baseX - offset / 2;
                    cut_x = baseX - baseWidth / 2 - offset / 2;
                }
                else {
                    newBlock.x = baseX + (baseWidth / 2) - (newBlockWidth / 2);
                    cut_x = baseX + baseWidth / 2 + offset / 2;
                }

                scene.physics.add.existing(newBlock);
                newBlock.body.setImmovable(true);
                base = newBlock;  // 새 블록이 기반이 됨
                movingBlock.width = newBlockWidth;
                movingBlock.x = Phaser.Math.Between(0, 1) * config.width;
                movingBlock.y -= blockHeight;
                blockSpeed += 10;  // 속도 점진적 증가
                movingBlock.body.setVelocityX(blockSpeed * defaultWidth);

                // 놓인 블록에 대응하는 이미지 생성
                let placedBlockImage = scene.add.image(base.x, base.y, 'blockImage');
                placedBlockImage.displayHeight = blockHeight; // 높이는 고정
                placedBlockImage.displayWidth = newBlockWidth; // 잘린 너비에 맞춤


                // 잘린 블럭 떨어트리기
                let cutBlock = scene.add.image(cut_x, base.y, 'blockImage');
                cutBlock.displayHeight = blockHeight;
                cutBlock.displayWidth = offset;

                scene.tweens.add({
                    targets: cutBlock,
                    y: cutBlock.y + 1000,
                    duration: 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        cutBlock.destroy();
                    }
                })


                // 스택된 블록 수 증가
                stackHeight++;

                // 화면을 blockHeight 내려가기 (카메라 이동)
                scene.cameras.main.scrollY = - stackHeight * blockHeight;

                // 구름도 화면 이동에 맞춰서 아래로 함께 이동
                clouds.forEach(cloud => {
                    cloud.y += blockHeight;
                });

                // 구름 생성 및 배경색 변경
                if (stackHeight % 3 == 0) {
                    createCloud(scene);

                }
                updateBackgroundColor(scene);

                score += 1;
                // 만약 오프셋이 미세하게 차이난다면 추가점수
                if (offset < 3) {
                    score += 1;
                }
                // 다이나믹 점수 중간이였다면 추가점수
                if (scoreText.style.color != "#000000") {
                    score += 1;
                }
                scoreText.text = `${score}`
                scoreText.y -= blockHeight;

                // 점수 다이나믹하게
                scoreText.setFontSize(parseInt(scoreText.style.fontSize, 10) + defaultWidth * 80);

                let redcode = min(parseInt(scoreText.style.color.substring(1, 3), 16) + 160, 255);
                scoreText.setColor(`#${redcode.toString(16)}0000`);
            }
        }
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
                debug: false
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

