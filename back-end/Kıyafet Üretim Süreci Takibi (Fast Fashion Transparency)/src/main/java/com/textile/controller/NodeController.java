package com.textile.controller;

import com.textile.entity.Block;
import com.textile.model.NodeInfo;
import com.textile.service.BlockchainService;
import com.textile.service.NodeCommunicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
public class NodeController {
    private final NodeCommunicationService nodeCommunicationService;
    private final BlockchainService blockchainService;

    @GetMapping("/info")
    public ResponseEntity<NodeInfo> getNodeInfo() {
        return ResponseEntity.ok(nodeCommunicationService.getNodeInfo());
    }

    @GetMapping("/blocks")
    public ResponseEntity<List<Block>> getBlocks() {
        return ResponseEntity.ok(blockchainService.getAllBlocks());
    }

    @PostMapping("/blocks/receive")
    public ResponseEntity<Void> receiveBlock(@RequestBody Block block) {
        if (blockchainService.isChainValid(List.of(block))) {
            blockchainService.addBlock(block.getTransactionsJson());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sync")
    public ResponseEntity<Void> triggerSync() {
        nodeCommunicationService.syncWithPeers();
        return ResponseEntity.ok().build();
    }
} 