package com.textile.controller;

import com.textile.entity.Block;
import com.textile.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
public class BlockController {
    private final BlockchainService blockchainService;

    @GetMapping
    public ResponseEntity<List<Block>> getAllBlocks() {
        return ResponseEntity.ok(blockchainService.getAllBlocks());
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateChain() {
        return ResponseEntity.ok(blockchainService.isChainValid());
    }

    @PostMapping
    public ResponseEntity<Block> addBlock(@RequestBody String transactionsJson) {
        Block block = blockchainService.addBlock(transactionsJson);
        return ResponseEntity.ok(block);
    }

    @PostMapping("/receive")
    public ResponseEntity<String> receiveChain(@RequestBody List<Block> newChain) {
        boolean replaced = blockchainService.replaceChain(newChain);
        if (replaced) {
            return ResponseEntity.ok("Zincir güncellendi.");
        } else {
            return ResponseEntity.badRequest().body("Gelen zincir geçersiz veya daha kısa.");
        }
    }
} 