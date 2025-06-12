package com.textile.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "blocks")
public class Block {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int index;
    private long timestamp;
    private String previousHash;
    private String hash;
    private int nonce;

    @Lob
    private String transactionsJson;
} 