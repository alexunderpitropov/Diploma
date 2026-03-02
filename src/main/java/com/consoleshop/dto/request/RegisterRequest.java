package com.consoleshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 64, message = "Password must be 6-64 characters")
    @Pattern(regexp = "^\\S+$", message = "Password must not contain spaces")
    private String password;

    @NotBlank(message = "First name is required")
    @Pattern(
            regexp = "^[A-Za-zА-Яа-яЁё\\- ]+$",
            message = "First name must contain only letters"
    )
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Pattern(
            regexp = "^[A-Za-zА-Яа-яЁё\\- ]+$",
            message = "Last name must contain only letters"
    )
    private String lastName;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    private String username;

    @Pattern(
            regexp = "^$|^\\+?\\d{8,15}$",
            message = "Phone must contain only digits and optional +"
    )
    private String phoneNumber;
}