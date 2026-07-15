package com.payment.ledger.controller;

import com.payment.ledger.dto.request.UpdateProfileRequest;
import com.payment.ledger.dto.response.UserProfileResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.exception.UserAlreadyExistsException;
import com.payment.ledger.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {

        // Validate username uniqueness across other users
        userRepository.findByUsername(request.getUsername()).ifPresent(user -> {
            if (!user.getId().equals(currentUser.getId())) {
                throw new UserAlreadyExistsException("Username already taken: " + request.getUsername());
            }
        });

        currentUser.setUsername(request.getUsername());
        if (request.getProfilePhoto() != null) {
            currentUser.setProfilePhoto(request.getProfilePhoto());
        }

        userRepository.save(currentUser);

        return ResponseEntity.ok(new UserProfileResponse(
                currentUser.getDisplayName(),
                currentUser.getEmail(),
                currentUser.getProfilePhoto()
        ));
    }
}
