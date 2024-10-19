window.onload = function () {
    // 페이지 로드 시 실행되는 함수
    const token = localStorage.getItem('joy_token');  // localStorage에서 joy_token 값 가져오기

    if (token) {
        validateToken(token)
            .then(() => {
                return Promise.all([
                    getRankingData(token)
                ]);

            }).then(() => {
                document.getElementById("loading_screen").style.display = "none";
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

    function getRankingData(token) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('content');
        let urls = url("/api/game/");
        if (id == "guitar_game") {
            urls += 'guitar/ranking'
        }
        else {
            urls += 'racing/ranking'
        }

        fetch(urls, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
        })
            .then(response => response.json())
            .then(data => {
                updateRankingUI(data);
            })
    }
};


function updateRankingUI(rankings) {
    // 1등, 2등, 3등의 DOM 요소를 가져옴
    const top1Box = document.querySelector('.top3-box.top1');
    const top23Boxes = document.querySelectorAll('.top3-box.top23');

    // 1등과 2, 3등을 각각 매칭
    if (rankings.length >= 1) {
        top1Box.querySelector('.name').innerText = rankings[0].name;
        top1Box.querySelector('.score-value').innerText = `${rankings[0].maxScore} 점`;
    }

    if (rankings.length >= 2) {
        top23Boxes[0].querySelector('.name').innerText = rankings[1].name;
        top23Boxes[0].querySelector('.score-value').innerText = `${rankings[1].maxScore} 점`;
    }

    if (rankings.length >= 3) {
        top23Boxes[1].querySelector('.name').innerText = rankings[2].name;
        top23Boxes[1].querySelector('.score-value').innerText = `${rankings[2].maxScore} 점`;
    }

    // 4등부터는 ranking-container에 추가
    const rankingContainer = document.querySelector('.ranking-container');
    for (let i = 3; i < rankings.length; i++) {
        const rank = i + 1; // 4등부터 시작
        const name = rankings[i].name;
        const score = rankings[i].maxScore;

        // 새로운 랭킹 박스를 만듦
        const rankingBox = document.createElement('div');
        rankingBox.classList.add('ranking-box');

        rankingBox.innerHTML = `
            <div class="rank">${rank}</div>
            <div class="name">${name}</div>
            <div class="score">${score}점</div>
        `;

        // ranking-container에 추가
        rankingContainer.appendChild(rankingBox);
    }
}


document.getElementById("logout").addEventListener("click", function () {
    let confirmation = confirm("로그아웃 하시겠습니까?");
    if (confirmation) {
        localStorage.removeItem('joy_token');  // 토큰 제거
        window.location.href = "/login";  // 로그인 페이지로 이동
    }
});

document.getElementById("back").addEventListener('click', function () {
    window.location.href = "/";
});