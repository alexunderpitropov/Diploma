package com.consoleshop.service;

import com.consoleshop.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse getById(Long id);
    List<UserResponse> getAll();
    void deleteById(Long id);
}