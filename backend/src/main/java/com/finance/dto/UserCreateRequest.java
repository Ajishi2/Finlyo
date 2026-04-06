package com.finance.dto;

import com.finance.entity.Role;
import com.finance.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserCreateRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private Role role;

    public UserCreateRequest() {}

    public UserCreateRequest(String firstName, String lastName, String email, String password, Role role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public static UserCreateRequestBuilder builder() {
        return new UserCreateRequestBuilder();
    }

    public static class UserCreateRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private Role role;

        public UserCreateRequestBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserCreateRequestBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserCreateRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserCreateRequestBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserCreateRequestBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public UserCreateRequest build() {
            UserCreateRequest request = new UserCreateRequest();
            request.firstName = this.firstName;
            request.lastName = this.lastName;
            request.email = this.email;
            request.password = this.password;
            request.role = this.role;
            return request;
        }
    }
}
