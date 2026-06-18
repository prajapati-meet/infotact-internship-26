package com.payment.ledger.controller;


import com.payment.ledger.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.payment.ledger.dto.request.LoginRequest;
import com.payment.ledger.dto.request.RegisterRequest;
import com.payment.ledger.dto.response.AuthResponse;
import com.payment.ledger.service.JwtService;
import com.payment.ledger.service.UserService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/auth")

public class AuthController {
	
	private final UserService userService;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	
	public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtService jwtService) {
		this.userService=userService;
		this.authenticationManager=authenticationManager;
		this.jwtService=jwtService;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
	    AuthResponse response = userService.register(request);

	    return ResponseEntity.status(HttpStatus.CREATED)
	            .body(response);
	}
	@PostMapping("/login")
	public ResponseEntity<AuthResponse>login(@Valid @RequestBody LoginRequest request){
		
		Authentication auth=authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(),request.getPassword()));
		
		User user=(User)auth.getPrincipal();
		String token=jwtService.generateToken(user);
		
		AuthResponse response = new AuthResponse(
                token,
                86400000L,
                user.getEmail(),
                user.getDisplayName()
        );

        return ResponseEntity.ok(response);
	}

}
