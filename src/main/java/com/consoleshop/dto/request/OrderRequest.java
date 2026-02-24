package com.consoleshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {

    @NotBlank
    private String deliveryAddress;
}