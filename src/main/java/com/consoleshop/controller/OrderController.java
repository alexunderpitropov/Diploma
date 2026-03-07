package com.consoleshop.controller;

import com.consoleshop.dto.request.OrderRequest;
import com.consoleshop.dto.response.OrderResponse;
import com.consoleshop.service.OrderService;
import com.consoleshop.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@AuthenticationPrincipal UserDetails userDetails,
                                                @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.create(securityUtils.getUserId(userDetails), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getByUserId(securityUtils.getUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@AuthenticationPrincipal UserDetails userDetails,
                                                 @PathVariable Long id) {
        Long userId = securityUtils.getUserId(userDetails);
        OrderResponse order = orderService.getById(id);
        List<OrderResponse> myOrders = orderService.getByUserId(userId);
        if (myOrders.stream().noneMatch(o -> o.getId().equals(id))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable Long id) {
        Long userId = securityUtils.getUserId(userDetails);
        return ResponseEntity.ok(orderService.cancel(id, userId));
    }
}