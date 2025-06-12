package com.textile.service;

import com.textile.entity.Block;
import com.textile.model.NodeInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NodeCommunicationService {
    private final BlockchainService blockchainService;
    private final RestTemplate restTemplate;

    @Value("${blockchain.peers}")
    private String peers;

    @Value("${blockchain.node.id}")
    private String nodeId;

    @Value("${blockchain.sync.interval}")
    private long syncInterval;

    @Scheduled(fixedDelayString = "${blockchain.sync.interval}")
    public void syncWithPeers() {
        List<String> peerList = Arrays.asList(peers.split(","));
        
        for (String peer : peerList) {
            try {
                String peerUrl = "http://" + peer + "/api/blocks";
                ResponseEntity<Block[]> response = restTemplate.getForEntity(peerUrl, Block[].class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    List<Block> peerBlocks = Arrays.asList(response.getBody());
                    blockchainService.replaceChain(peerBlocks);
                }
            } catch (Exception e) {
                System.err.println("Peer sync failed for " + peer + ": " + e.getMessage());
            }
        }
    }

    public NodeInfo getNodeInfo() {
        return NodeInfo.builder()
                .nodeId(nodeId)
                .blockCount(blockchainService.getAllBlocks().size())
                .peers(peers)
                .build();
    }

    public void broadcastNewBlock(Block block) {
        List<String> peerList = Arrays.asList(peers.split(","));
        
        for (String peer : peerList) {
            try {
                String peerUrl = "http://" + peer + "/api/blocks/receive";
                restTemplate.postForEntity(peerUrl, block, Void.class);
            } catch (Exception e) {
                System.err.println("Block broadcast failed for " + peer + ": " + e.getMessage());
            }
        }
    }
} 