package com.payment.ledger.dto.response;

public class UserProfileResponse {
    private String username;
    private String email;
    private String profilePhoto;

    public UserProfileResponse() {}

    public UserProfileResponse(String username, String email, String profilePhoto) {
        this.username = username;
        this.email = email;
        this.profilePhoto = profilePhoto;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }
}
