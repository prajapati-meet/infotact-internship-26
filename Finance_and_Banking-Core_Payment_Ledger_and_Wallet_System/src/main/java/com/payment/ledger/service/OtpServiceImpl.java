package com.payment.ledger.service;

import com.payment.ledger.exception.InvalidOtpException;
import com.payment.ledger.exception.OtpExpiredException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
public class OtpServiceImpl implements OtpService {

    private static final String OTP_PREFIX = "otp:";

    private final RedisTemplate<String, Object> redisTemplate;
    private final JavaMailSender mailSender;

    @Value("${application.otp.expiration-minutes}")
    private long otpExpirationMinutes;

    @Value("${application.otp.length}")
    private int otpLength;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public OtpServiceImpl(RedisTemplate<String, Object> redisTemplate, JavaMailSender mailSender) {
        this.redisTemplate = redisTemplate;
        this.mailSender = mailSender;
    }

    @Override
    public void generateAndSendOtp(String email) {
        String otp = generateOtp();

        String key = OTP_PREFIX + email;
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(otpExpirationMinutes));

        sendOtpEmail(email, otp);
    }

    @Override
    public void validateOtp(String email, String otp) {
        String key = OTP_PREFIX + email;
        Object storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new OtpExpiredException("OTP has expired or was never generated. Please request a new one.");
        }

        if (!storedOtp.toString().equals(otp)) {
            throw new InvalidOtpException("Invalid OTP. Please check your email and try again.");
        }
    }

    @Override
    public void clearOtp(String email) {
        redisTemplate.delete(OTP_PREFIX + email);
    }

    @Override
    public void resendOtp(String email) {
        String cooldownKey = "otp:cooldown:" + email;
        Object cooldown = redisTemplate.opsForValue().get(cooldownKey);
        if (cooldown != null) {
            throw new InvalidOtpException("Please wait 60 seconds before requesting another OTP.");
        }

        // Generate and send new OTP
        generateAndSendOtp(email);

        // Set cooldown key for 60 seconds
        redisTemplate.opsForValue().set(cooldownKey, "true", Duration.ofSeconds(60));
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private void sendOtpEmail(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Your OTP for Core Payment Ledger Registration");
        message.setText(
                "Hello,\n\n" +
                        "Your OTP for registration is: " + otp + "\n\n" +
                        "This OTP is valid for " + otpExpirationMinutes + " minutes.\n\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "Core Payment Ledger Team"
        );
        mailSender.send(message);
    }
}