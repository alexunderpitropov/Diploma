package com.consoleshop.service;

import com.consoleshop.dto.request.OrderRequest;
import com.consoleshop.dto.response.OrderResponse;
import com.consoleshop.entity.OrderStatus;
import java.util.List;

public interface OrderService {
    OrderResponse create(Long userId, OrderRequest request);
    OrderResponse getById(Long id);
    List<OrderResponse> getByUserId(Long userId);
    List<OrderResponse> getAll();
    OrderResponse updateStatus(Long id, OrderStatus status);
    OrderResponse cancel(Long id, Long userId);
}