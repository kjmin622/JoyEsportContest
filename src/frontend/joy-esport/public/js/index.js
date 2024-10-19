window.onload = function () {
    // 페이지 로드 시 실행되는 함수
    const token = localStorage.getItem('joy_token');  // localStorage에서 joy_token 값 가져오기

    if (token) {
        validateToken(token)
            .then(() => {
                return Promise.all([
                    getUserData(token),
                    getGuitarData(token),
                    getRacingData(token),
                    getTicketData(token)
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
                document.getElementById("user-name").innerText = data["name"];
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
                document.getElementById("guitar_score").innerText = data["score"];
            })
    }

    function getRacingData(token) {
        fetch(url("/api/game/racing/get_score"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById("racing_score").innerText = data["score"];
            })
    }

    function getTicketData(token) {
        fetch(url("/api/game/safe/get_point"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById("ticket_count").innerText = data["ticketCount"];
                document.getElementById("ticket_score").innerText = data["point"] + "/" + data["needPoint"];
            })
    }
};





document.getElementById("logout").addEventListener("click", function () {
    let confirmation = confirm("로그아웃 하시겠습니까?");
    if (confirmation) {
        localStorage.removeItem('joy_token');  // 토큰 제거
        window.location.href = "/login";  // 로그인 페이지로 이동
    }
});

// 각 버튼에 페이지 이동 이벤트 추가
document.querySelectorAll(".button-image").forEach((button, index) => {
    button.addEventListener("click", function () {
        if (index === 0) {
            window.location.href = "/guitar_game";  // 첫 번째 버튼 클릭 시 페이지 이동
        } else if (index === 1) {
            window.location.href = "/racing_game";  // 두 번째 버튼 클릭 시 페이지 이동
        } else if (index === 2) {
            window.location.href = "/safe_game";  // 세 번째 버튼 클릭 시 페이지 이동
        }
    });
});

// 각 버튼에 랭킹 페이지 이동 이벤트 추가
document.querySelectorAll(".score-container").forEach((button, index) => {
    button.addEventListener("click", function () {
        if (index === 0) {
            window.location.href = "/ranking?content=guitar_game";  // 첫 번째 버튼 클릭 시 페이지 이동
        } else if (index === 1) {
            window.location.href = "/ranking?content=racing_game";  // 두 번째 버튼 클릭 시 페이지 이동
        }
    });
});