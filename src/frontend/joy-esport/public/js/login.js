window.onload = function () {
    // 저장된 아이디 비밀번호 있다면 자동완성
    const id = localStorage.getItem('id');
    const pw = localStorage.getItem('pw');
    if (id && pw) {
        document.getElementById("input_hanyang").value = id;
        document.getElementById("input_password").value = pw;
    }
    else {
        let form = document.getElementsByClassName("form")[0];
        resetClass(form, "signin");
        form.classList.add("signup");
        document.getElementById("submit-btn").innerText = "회원가입";
    }
    validateToken().then(() => {
        return new Promise((resolve, reject) => {
            const urlParams = new URLSearchParams(window.location.search);
            // 'query'라는 쿼리 파라미터가 있는지 확인
            if (urlParams.has('query')) {
                const queryValue = urlParams.get('query');
                fetch(url("/api/auth/certification") + `?query=${queryValue}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(response => {
                    return new Promise((resolve, reject) => {
                        if (!response.ok) {
                            throw new Error("verified error");
                        }
                        resolve(response.text());
                    })
                }).then(data => {
                    console.log(data);
                    localStorage.setItem('joy_token', data);
                    window.location.href = "/";
                }).catch(error => {
                    console.log(error);
                    showMessage("오류가 발생했습니다. 회원가입을 다시 시도하시고, 관리자에게 문의해주세요.");
                })
            }
            resolve();
        }).then(() => {
            document.getElementById("loading_screen").style.display = "none";
        });

    });

}


// 토큰을 검증하는 함수
function validateToken() {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('joy_token');
        if (token) {
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
                        window.location.href = "/";
                        resolve(); // 토큰이 유효하면 여기서 코드 끝
                    } else {
                        throw new Error();
                    }
                })
                .catch(error => {
                    localStorage.removeItem('joy_token');  // 유효하지 않으면 토큰 제거
                    resolve();
                });
        }
        resolve();
    });
}


function resetClass(element, classname) {
    element.classList.remove(classname);
}
document.getElementsByClassName("show-signup")[0].addEventListener("click", function () {
    let form = document.getElementsByClassName("form")[0];
    resetClass(form, "signin");
    form.classList.add("signup");
    document.getElementById("submit-btn").innerText = "회원가입";
});
document.getElementsByClassName("show-signin")[0].addEventListener("click", function () {
    let form = document.getElementsByClassName("form")[0];
    resetClass(form, "signup");
    form.classList.add("signin");
    document.getElementById("submit-btn").innerText = "로그인";
});

// 로그인 또는 회원가입 폼을 제출할 때 처리하는 함수
document.getElementById("submit-btn").addEventListener("click", function () {
    let form = document.getElementsByClassName("form")[0];
    if (form.classList.contains("signin")) {
        // 로그인 처리
        login();
    } else if (form.classList.contains("signup")) {
        // 회원가입 처리
        signup();
    }
});


// 로그인 함수
function login() {
    let email = document.getElementById('input_hanyang').value;
    let password = document.getElementById('input_password').value;
    document.getElementById("loading_screen").style.display = "block";
    fetch(url("/api/auth/signin"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
    })
        .then(response => {
            if (response.ok) {
                localStorage.setItem("id", email);
                localStorage.setItem("pw", password);
                return response.text();
            }
            else {
                if (response.status === 403) {
                    throw new Error("Not Verified Email");
                }
                else if (response.status === 404 || response.status === 400) {
                    throw new Error("Invalid Account");
                }
                else {
                    throw new Error("Server Error");
                }
            }
        })
        .then(data => {
            console.log("로그인 성공:", data);
            localStorage.setItem('joy_token', data);
            location.reload();
        })
        .catch(error => {
            document.getElementById("loading_screen").style.display = "none";
            if (error.message.includes("Not Verified Email")) {
                showMessage("메일 인증을 완료한 후 로그인해주세요!");
            }
            else if (error.message.includes("Invalid Account")) {
                showMessage("입력값을 다시 확인해주세요!");
            }
            else {
                showMessage("인터넷 연결을 확인해주시고, 관리자에게 문의해주세요.");
            }

        });
}

// 회원가입 함수
function signup() {
    let email = document.getElementById('input_hanyang').value;
    let password = document.getElementById('input_password').value;
    let name = document.getElementById('input_name').value;
    let studentId = document.getElementById('input_studentid').value;

    if (!email.includes("hanyang.")) {
        showMessage("한양 이메일이여야 합니다.");
    } else if (password.length < 4 || 20 < password.length) {
        showMessage("비밀번호는 4자 이상, 20자 이하입니다.");
    } else if (name === "") {
        showMessage("이름을 입력해주세요!");
    } else if (studentId.length != 10) {
        showMessage("학번은 10자 입니다.");
    } else if (isNaN(studentId)) {
        showMessage("학번은 숫자로 구성됩니다.");
    }
    else {
        document.getElementById("loading_screen").style.display = "block";
        fetch(url("/api/auth/signup"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
                name: name,
                student_id: studentId,
            }),
        })
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                else {
                    if (response.status === 400) {
                        throw new Error("Not Correct Email");
                    } else if (response.status === 409) {
                        throw new Error("Already Exist Email");
                    } else {
                        throw new Error("Internet Error");
                    }
                }
            })
            .then(data => {
                document.getElementById("loading_screen").style.display = "none";
                // 회원가입 성공 후 필요한 작업 추가
                let form = document.getElementsByClassName("form")[0];
                resetClass(form, "signup");
                form.classList.add("signin");
                document.getElementById("submit-btn").innerText = "로그인";
                showMessage("메일 인증을 완료한 후 로그인해주세요!");
            })
            .catch(error => {
                document.getElementById("loading_screen").style.display = "none";
                if (error.message.includes("Not Correct Email")) {
                    showMessage("메일이 올바르지 않습니다.");
                } else if (error.message.includes("Already Exist Email")) {
                    showMessage("메일이 이미 존재합니다.");
                } else {
                    showMessage("인터넷 연결을 확인해주시고, 관리자에게 문의해주세요.");
                }
            });
    }
}

// 메시지를 로그인 버튼 아래에 표시하는 함수
function showMessage(message) {
    const formElements = document.querySelector('.form-elements');

    // 기존 메시지가 있으면 제거
    let existingMessage = document.querySelector('.form-elements .message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // 새로운 메시지 div 생성
    let messageDiv = document.createElement('div');
    messageDiv.innerText = message;
    messageDiv.classList.add('message');
    formElements.appendChild(messageDiv);  // 메시지를 form-elements 안에 추가

    // 1초 후에 메시지를 흐려지게 함
    setTimeout(() => {
        messageDiv.classList.add('fade-out');
    }, 1000);  // 메시지가 1초 동안 표시된 후 사라짐

    // 4초 후에 메시지를 DOM에서 제거
    setTimeout(() => {
        messageDiv.remove();
    }, 2500);  // 2.5초 동안의 애니메이션이 끝난 후 메시지 제거
}
