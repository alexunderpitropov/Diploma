package com.consoleshop.service;

import com.consoleshop.dto.response.UserResponse;
import java.util.List;

public interface UserService {

    UserResponse getById(Long id);

    UserResponse getByEmail(String email);

    List<UserResponse> getAll();

    void deleteById(Long id);
}