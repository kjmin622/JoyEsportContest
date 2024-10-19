package com.joy.esports.util;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class MailUtil {
    private JavaMailSender mailSender;
    // 생성자 주입
    public MailUtil(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    public void emailCertiSend(String email, String query, Long id){
        try{
            // 이메일 보내기
            SimpleMailMessage message = new SimpleMailMessage();
            int length = query.length() + 1000;
            message.setTo(email);
            message.setSubject("조이 E-sport 대회 인증 메일");
            message.setText(String.format("아래 링크로 접속해주세요!!!\nhttp://joy.esport.p-e.kr:3000/login?query=%s", "" + length + query + id));
            message.setFrom("kjmin622@hanyang.ac.kr"); // 보낸 사람 이메일 주소

            mailSender.send(message);
        }catch(Exception e){
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }
}
