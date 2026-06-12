package com.payment.ledger.service;

import com.payment.ledger.dto.request.RegisterRequest;
import com.payment.ledger.dto.response.AuthResponse;
<<<<<<< HEAD
import com.payment.ledger.entity.User;

import jakarta.validation.Valid;

public class UserService {

	public AuthResponse register(@Valid RegisterRequest request) {
		
		return null;
	}
	
	 
	       
	}
	


=======

public interface UserService {
     AuthResponse register(RegisterRequest request);
}
>>>>>>> main
