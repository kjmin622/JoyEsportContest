window.onload = function () {
    // 페이지 로드 시 실행되는 함수
    const token = localStorage.getItem('joy_token');  // localStorage에서 joy_token 값 가져오기

    if (token) {
        validateToken(token)
            .then(() => {
                return Promise.all([
                    settingSubmitList(token),
                    settingTicketData(token)
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
};


function resetClass(element, classname) {
    element.classList.remove(classname);
}

let now_cursor = 0;
let input_number = 0;




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


// 넘버버튼 클릭
for (let i = 0; i < 12; i++) {
    document.getElementsByClassName("button")[i].addEventListener("click", () => btn_click(i));
}
function btn_click(cmd) {
    let i = cmd;
    // 숫자패드 눌렀을 때
    if (now_cursor < 4 && ((0 <= i && i < 9) || i == 10)) {
        if (i == 10) {
            cmd = 0;
        }
        else {
            cmd = i + 1;
        }

        document.getElementsByClassName("input_number_box")[now_cursor].innerText = cmd;
        resetClass(document.getElementsByClassName("number_pointer")[now_cursor], "input_idx");

        if (now_cursor + 1 < 4) {
            document.getElementsByClassName("number_pointer")[now_cursor + 1].classList.add("input_idx");
        }

        now_cursor += 1;
        input_number = input_number * 10 + cmd;
    }
    else if (now_cursor > 0 && cmd == 9) {
        input_number = parseInt(input_number / 10);
        document.getElementsByClassName("input_number_box")[now_cursor - 1].innerText = "";
        if (now_cursor != 4) {
            resetClass(document.getElementsByClassName("number_pointer")[now_cursor], "input_idx");
        }
        document.getElementsByClassName("number_pointer")[now_cursor - 1].classList.add("input_idx");
        now_cursor -= 1;
    }
    else if (now_cursor == 4 && cmd == 11) {
        let token = localStorage.getItem("joy_token");
        fetch(url("/api/game/safe/submit_tickets"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token, number: input_number }),
        }).then(response => {
            // 티켓 전송 성공!
            if (response.ok) {
                settingTicketData(token);
                settingSubmitList(token);
            }
            else if (response.status === 400) {
                alert("티켓이 없습니다!");
            }
            else {
                window.location.href = "/login";
            }
        })
    }
}


let now_support;
// 도움 버튼 클릭
document.getElementsByClassName("support_btn")[0].addEventListener('click', () => {
    document.getElementsByClassName("support_container")[0].classList.add("sup_ing");
    document.getElementsByClassName("sup_1")[0].classList.add("sup_this");
    now_support = 1;
});

// 도움중일 때 클릭
document.getElementsByClassName("sup_background")[0].addEventListener('click', () => {
    resetClass(document.getElementsByClassName("sup_" + now_support)[0], "sup_this");
    now_support += 1;
    if (now_support <= 4) {
        document.getElementsByClassName("sup_" + now_support)[0].classList.add("sup_this");
    }
    else {
        resetClass(document.getElementsByClassName("support_container")[0], "sup_ing");
    }
});

function settingSubmitList(token) {
    return new Promise((resolve, reject) => {
        const elements = document.querySelectorAll('.submit_log');
        elements.forEach(element => element.remove());
        resolve();
    }).then(() => {
        fetch(url("/api/game/safe/get_tickets"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
        }).then(response => {
            new Promise((resolve, reject) => {
                if (response.ok) {
                    resolve(response);
                }
                else {
                    window.location.href = "/login";
                    reject();
                }
            }).then(response => {
                response.json().then((res => {
                    let data = res.data;
                    const logContainer = document.querySelector('.submit_container');
                    for (let i = 0; i < data.length; i++) {
                        let number = data[i].number.toString();
                        for (let i = number.length; i < 4; i++) {
                            number = "0" + number;
                        }

                        const logBox = document.createElement('div');
                        logBox.classList.add('submit_log');

                        logBox.innerHTML = `
                    <div class="log_count"><span>${i + 1}</span></div>
                    <div class="log_number"><span>${number}</span></div>
                `;

                        logContainer.appendChild(logBox);
                    }
                    for (let i = data.length; i < 10; i++) {
                        const logBox = document.createElement('div');
                        logBox.classList.add('submit_log');

                        logBox.innerHTML = `
                    <div class="log_count"><span>${i + 1}</span></div>
                    <div class="log_number"><span></span></div>
                `;
                        logContainer.appendChild(logBox);
                    }
                }));
            })

        });


    });
}


function settingTicketData(token) {
    fetch(url("/api/game/safe/get_point"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementsByClassName("exist_ticket")[0].innerText = `보유 티켓: ${data["ticketCount"]}개`;
        })
}


