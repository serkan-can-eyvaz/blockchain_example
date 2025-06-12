package com.textile.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Block {
    private Long index;
    private Long timestamp;
    private String previousHash;
    private String hash;
    private int nonce;
    private List<Object> transactions;
    private String nodeId; // Hangi node tarafından oluşturulduğu
} 