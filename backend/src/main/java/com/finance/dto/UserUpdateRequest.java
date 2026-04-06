package com.finance.dto;

public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;

    public UserUpdateRequest() {}

    public UserUpdateRequest(String firstName, String lastName, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public static UserUpdateRequestBuilder builder() {
        return new UserUpdateRequestBuilder();
    }

    public static class UserUpdateRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;

        public UserUpdateRequestBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserUpdateRequestBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserUpdateRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserUpdateRequest build() {
            UserUpdateRequest request = new UserUpdateRequest();
            request.firstName = this.firstName;
            request.lastName = this.lastName;
            request.email = this.email;
            return request;
        }
    }
}
