package com.consoleshop.service;

import com.consoleshop.dto.request.LoginRequest;
import com.consoleshop.dto.request.RegisterRequest;
import com.consoleshop.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}